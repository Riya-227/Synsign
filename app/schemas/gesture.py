"""
Gesture Recognition Pydantic Schemas

Data validation models for gesture recognition inputs and predictions.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class GestureLandmarkInput(BaseModel):
    """63 3D landmark values (21 points x 3D coords)."""
    landmarks: List[float] = Field(..., min_length=63, max_length=63, description="Flattened 21x3 3D landmark coordinates")


class GesturePredictionResponse(BaseModel):
    """Result of ISL gesture classification."""
    gesture: str = Field(..., description="Recognized ISL sign / alphabet label")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Prediction probability confidence score")
    landmarks: Optional[List[float]] = Field(None, description="Wrist-normalized 63 3D landmark coordinates")


class GestureLabelsResponse(BaseModel):
    """List of supported ISL gesture labels."""
    labels: List[str] = Field(..., description="Supported ISL gesture alphabet labels")
