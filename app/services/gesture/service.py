"""
Gesture Recognition Service Wrapper (service.py)

Re-exports GestureService and components from app.services.gesture.gestures
to maintain architectural compatibility with existing routers and modules.
"""

from app.services.gesture.gestures import (
    GestureService,
    ISLGestureClassifier,
    normalize_landmarks,
)

__all__ = ["GestureService", "ISLGestureClassifier", "normalize_landmarks"]
