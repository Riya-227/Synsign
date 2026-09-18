"""
Gesture Recognition Router

Endpoints:
  POST /recognize          — Classify ISL gesture from an uploaded image/frame
  POST /predict-landmarks  — Classify ISL gesture directly from 63 3D landmark values
  GET  /labels             — List all supported ISL gesture labels
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, status

from app.services.gesture.gestures import GestureService
from app.schemas.gesture import (
    GesturePredictionResponse,
    GestureLabelsResponse,
    GestureLandmarkInput,
)

router = APIRouter()
gesture_service = GestureService()


@router.post(
    "/recognize",
    response_model=GesturePredictionResponse,
    summary="Classify ISL gesture from image frame",
)
async def recognize_gesture(file: UploadFile = File(...)):
    """
    Classify an ISL gesture from an uploaded image frame.
    Extracts 21 3D hand landmarks via MediaPipe, normalizes relative to wrist,
    and runs PyTorch model inference.
    """
    contents = await file.read()
    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty image file provided",
        )
    result = gesture_service.predict(contents)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No hand landmarks detected in the provided image",
        )
    return result


@router.post(
    "/predict-landmarks",
    response_model=GesturePredictionResponse,
    summary="Classify ISL gesture from 63 3D landmark array",
)
async def predict_landmarks(payload: GestureLandmarkInput):
    """
    Classify ISL gesture directly from a pre-extracted 63-element 3D landmark array.
    """
    result = gesture_service.predict_landmarks(payload.landmarks)
    return result


@router.get(
    "/labels",
    response_model=GestureLabelsResponse,
    summary="List supported ISL gesture labels",
)
async def list_labels():
    """Return the list of ISL gesture labels the model can recognize (A-Z)."""
    return {"labels": gesture_service.get_labels()}
