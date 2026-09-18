"""
Gesture Recognition Test Suite (test_gesture.py)

Tests for Feature 2: AI Gesture Recognition pipeline:
  1. Wrist-relative landmark normalization (normalize_landmarks)
  2. PyTorch classifier model architecture (ISLGestureClassifier)
  3. Gesture service engine (GestureService) loading model weights and torch.no_grad() inference
  4. FastAPI router endpoints (/labels, /predict-landmarks, /recognize)
"""

import os
import io
import pytest
import numpy as np
import torch
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.services.gesture.gestures import (
    GestureService,
    ISLGestureClassifier,
    normalize_landmarks,
)

client = TestClient(app)


# ═══════════════════════════════════════════════════════════════════════════
# 1. LANDMARK NORMALIZATION TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestLandmarkNormalization:
    """Tests for wrist-relative landmark normalization."""

    def test_wrist_relative_subtraction(self):
        # 21 points where wrist (index 0) is at (10, 20, 30)
        pts = np.zeros((21, 3), dtype=np.float32)
        pts[0] = [10.0, 20.0, 30.0]
        pts[1] = [12.0, 24.0, 30.0]

        normalized = normalize_landmarks(pts.flatten())
        norm_pts = normalized.reshape(21, 3)

        # Wrist should be at (0, 0, 0) after subtraction
        np.testing.assert_allclose(norm_pts[0], [0.0, 0.0, 0.0], atol=1e-5)

    def test_scale_normalization(self):
        pts = np.random.uniform(5.0, 25.0, size=(21, 3)).astype(np.float32)
        normalized = normalize_landmarks(pts.flatten())
        norm_pts = normalized.reshape(21, 3)

        # Max distance from wrist should be <= 1.0 (or close to 1.0)
        distances = np.linalg.norm(norm_pts, axis=1)
        assert np.max(distances) <= 1.0 + 1e-5

    def test_output_shape(self):
        pts = np.random.randn(63).astype(np.float32)
        normalized = normalize_landmarks(pts)
        assert normalized.shape == (63,)

    def test_invalid_input_shape_raises(self):
        with pytest.raises(ValueError):
            normalize_landmarks(np.zeros(20))


# ═══════════════════════════════════════════════════════════════════════════
# 2. PYTORCH MODEL ARCHITECTURE TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestISLGestureClassifier:
    """Tests for PyTorch ISLGestureClassifier network."""

    def test_model_forward_pass(self):
        model = ISLGestureClassifier(num_classes=26)
        model.eval()
        dummy_input = torch.randn(4, 63)
        with torch.no_grad():
            output = model(dummy_input)

        assert output.shape == (4, 26)
        assert not torch.isnan(output).any()

    def test_single_sample_inference(self):
        model = ISLGestureClassifier(num_classes=26)
        model.eval()
        dummy_input = torch.randn(1, 63)
        with torch.no_grad():
            logits = model(dummy_input)
            probs = torch.softmax(logits, dim=-1)

        assert probs.shape == (1, 26)
        assert torch.isclose(torch.sum(probs), torch.tensor(1.0), atol=1e-4)


# ═══════════════════════════════════════════════════════════════════════════
# 3. GESTURE SERVICE ENGINE TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestGestureService:
    """Tests for GestureService engine."""

    def test_load_model_weights(self):
        service = GestureService()
        assert os.path.exists(service.model_path)
        loaded = service.load_model_weights()
        assert loaded is True

    def test_predict_landmarks(self):
        service = GestureService()
        dummy_pts = np.random.randn(63).astype(np.float32).tolist()
        result = service.predict_landmarks(dummy_pts)

        assert "gesture" in result
        assert result["gesture"] in service.get_labels()
        assert "confidence" in result
        assert 0.0 <= result["confidence"] <= 1.0
        assert "landmarks" in result
        assert len(result["landmarks"]) == 63

    def test_get_labels(self):
        service = GestureService()
        labels = service.get_labels()
        assert len(labels) == 26
        assert labels[0] == "A"
        assert labels[-1] == "Z"


# ═══════════════════════════════════════════════════════════════════════════
# 4. API ROUTER ENDPOINT TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestGestureEndpoints:
    """Integration tests for gesture router endpoints."""

    def test_get_labels_endpoint(self):
        response = client.get("/api/v1/gesture/labels")
        assert response.status_code == 200
        data = response.json()
        assert "labels" in data
        assert len(data["labels"]) == 26

    def test_predict_landmarks_endpoint(self):
        dummy_pts = np.random.randn(63).astype(np.float32).tolist()
        response = client.post(
            "/api/v1/gesture/predict-landmarks",
            json={"landmarks": dummy_pts},
        )
        assert response.status_code == 200
        data = response.json()
        assert "gesture" in data
        assert "confidence" in data
        assert "landmarks" in data

    def test_recognize_image_upload_endpoint(self):
        # Create a synthetic 100x100 RGB image
        img = Image.new("RGB", (100, 100), color="blue")
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)

        response = client.post(
            "/api/v1/gesture/recognize",
            files={"file": ("test.jpg", buf, "image/jpeg")},
        )
        assert response.status_code == 200
        data = response.json()
        assert "gesture" in data
        assert "confidence" in data
        assert "landmarks" in data
