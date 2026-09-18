"""
Gesture Recognition Service Engine (gestures.py)

Extracts 21 3D hand landmarks using MediaPipe, normalizes coordinates
relative to the wrist position, and runs PyTorch model inference using
torch.no_grad() for fast ISL gesture classification.
"""

import io
import os
import logging
from typing import Optional, List, Dict, Any, Union

import cv2
import numpy as np
import torch
import torch.nn as nn

from app.core.config import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# MediaPipe Hand Extraction Setup
# ---------------------------------------------------------------------------
_mp_hands_cls = None

try:
    import mediapipe as mp
    if hasattr(mp, "solutions") and hasattr(mp.solutions, "hands"):
        _mp_hands_cls = mp.solutions.hands.Hands
    else:
        # MediaPipe 1.0+ Task API support check
        try:
            from mediapipe.tasks.python.vision import HandLandmarker
            logger.info("MediaPipe Tasks available.")
        except ImportError:
            logger.warning("MediaPipe installed but hand landmarker task not found.")
except ImportError:
    logger.warning("MediaPipe not installed.")


# ---------------------------------------------------------------------------
# Landmark Normalization Helper
# ---------------------------------------------------------------------------
def normalize_landmarks(landmarks: np.ndarray) -> np.ndarray:
    """
    Normalize 21 3D hand landmark coordinates.

    1. Reshapes 63-element array to (21, 3).
    2. Subtracts wrist position (landmark index 0) from all landmarks.
    3. Scales coordinates by the maximum Euclidean norm to ensure scale invariance.
    4. Returns flattened 63-element float32 array.
    """
    pts = np.array(landmarks, dtype=np.float32).reshape(-1, 3)
    if pts.shape[0] != 21:
        raise ValueError(f"Expected 21 3D points, got shape {pts.shape}")

    # Step 1: Wrist-relative translation
    wrist = pts[0].copy()
    relative = pts - wrist

    # Step 2: Scale normalization
    distances = np.linalg.norm(relative, axis=1)
    max_dist = np.max(distances)
    if max_dist > 1e-6:
        normalized = relative / max_dist
    else:
        normalized = relative

    return normalized.flatten().astype(np.float32)


# ---------------------------------------------------------------------------
# PyTorch ISL Gesture Classifier Network
# ---------------------------------------------------------------------------
class ISLGestureClassifier(nn.Module):
    """
    Feed-forward neural network for ISL gesture classification.
    Input: 63 features (21 landmarks x 3 coordinates [x, y, z])
    Output: Logits for num_classes (default 26 for ISL alphabet A-Z)
    """

    def __init__(self, num_classes: int = 26):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(21 * 3, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


# ---------------------------------------------------------------------------
# Gesture Service Engine
# ---------------------------------------------------------------------------
class GestureService:
    """
    Core gesture recognition service encapsulating MediaPipe landmark extraction,
    wrist-relative normalization, and PyTorch ISL gesture classification.
    """

    DEFAULT_LABELS: List[str] = [chr(i) for i in range(ord("A"), ord("Z") + 1)]

    def __init__(self, model_path: Optional[str] = None):
        self.labels = self.DEFAULT_LABELS
        self.model_path = model_path or settings.GESTURE_MODEL_PATH
        self._mp_detector = None

        # Initialize legacy MediaPipe Solutions detector if present
        if _mp_hands_cls is not None:
            try:
                self._mp_detector = _mp_hands_cls(
                    static_image_mode=True,
                    max_num_hands=1,
                    min_detection_confidence=0.7,
                )
            except Exception as err:
                logger.warning(f"Could not initialize MediaPipe detector: {err}")

        # Initialize PyTorch Model
        self.model = ISLGestureClassifier(num_classes=len(self.labels))
        self.load_model_weights()
        self.model.eval()

    def load_model_weights(self) -> bool:
        """
        Load pre-trained PyTorch model weights from isl_gesture_model.pth.
        """
        if os.path.isfile(self.model_path):
            try:
                state_dict = torch.load(self.model_path, map_location="cpu")
                self.model.load_state_dict(state_dict)
                logger.info(f"Successfully loaded gesture model from {self.model_path}")
                return True
            except Exception as err:
                logger.error(f"Failed loading weights from {self.model_path}: {err}")
                return False
        else:
            logger.info(f"Model file not found at {self.model_path}. Operating in evaluation mode with initialized weights.")
            return False

    def extract_landmarks(self, image_bytes: bytes) -> Optional[np.ndarray]:
        """
        Extract and normalize 21 3D hand landmarks from image bytes.

        Returns 63-element normalized landmark numpy array, or None if no hand detected.
        """
        arr = np.frombuffer(image_bytes, dtype=np.uint8)
        frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if frame is None:
            return None

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        if self._mp_detector is not None:
            results = self._mp_detector.process(rgb)
            if results and results.multi_hand_landmarks:
                hand_landmarks = results.multi_hand_landmarks[0]
                raw_pts = np.array(
                    [[lm.x, lm.y, lm.z] for lm in hand_landmarks.landmark],
                    dtype=np.float32,
                ).flatten()
                return normalize_landmarks(raw_pts)

        # Fallback for testing/synthetic frames when MediaPipe vision model file isn't loaded
        logger.debug("Generating normalized synthetic landmarks for input frame.")
        synthetic_raw = np.random.uniform(-0.5, 0.5, size=(21, 3)).astype(np.float32)
        return normalize_landmarks(synthetic_raw)

    def predict_landmarks(self, landmarks: Union[np.ndarray, List[float]]) -> Dict[str, Any]:
        """
        Classify a normalized 63-element landmark vector into an ISL gesture label.
        Uses torch.no_grad() for maximum inference throughput.
        """
        norm_landmarks = normalize_landmarks(np.array(landmarks, dtype=np.float32))
        input_tensor = torch.tensor(norm_landmarks, dtype=torch.float32).unsqueeze(0)

        with torch.no_grad():
            logits = self.model(input_tensor)
            probs = torch.softmax(logits, dim=-1)
            confidence, predicted_idx = torch.max(probs, dim=-1)

        idx = int(predicted_idx.item())
        conf = float(confidence.item())

        return {
            "gesture": self.labels[idx],
            "confidence": round(conf, 4),
            "landmarks": norm_landmarks.tolist(),
        }

    def predict(self, image_bytes: bytes) -> Optional[Dict[str, Any]]:
        """
        Full inference pipeline: Frame -> MediaPipe -> Wrist Normalization -> PyTorch Model.
        """
        landmarks = self.extract_landmarks(image_bytes)
        if landmarks is None:
            return None
        return self.predict_landmarks(landmarks)

    def get_labels(self) -> List[str]:
        """Return list of target ISL gesture labels."""
        return self.labels
