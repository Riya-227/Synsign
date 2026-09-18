"""
Pydantic Schemas

Shared data-validation models used across services for request parsing
and response serialization.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    username: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------------------------------------------------------------------------
# Gesture
# ---------------------------------------------------------------------------
class GesturePrediction(BaseModel):
    gesture: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    landmarks: Optional[List[float]] = None


# ---------------------------------------------------------------------------
# Speech
# ---------------------------------------------------------------------------
class TranscriptionResponse(BaseModel):
    transcription: str


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1)
    language: str = "en"


# ---------------------------------------------------------------------------
# Translation
# ---------------------------------------------------------------------------
class GlossResponse(BaseModel):
    input: str
    gloss: List[str]


class AnimationKey(BaseModel):
    token: str
    animation_id: str
    duration_ms: int = 800


class AnimationResponse(BaseModel):
    gloss: List[str]
    animations: List[AnimationKey]


# ---------------------------------------------------------------------------
# Dictionary
# ---------------------------------------------------------------------------
class SignEntry(BaseModel):
    id: str
    word: str
    category: str
    description: str
    animation_id: str


class DictionarySearchResponse(BaseModel):
    query: str
    results: List[SignEntry]
    count: int


# ---------------------------------------------------------------------------
# Pipeline (WebSocket messages)
# ---------------------------------------------------------------------------
class PipelineFrame(BaseModel):
    """Outbound WebSocket message for a successfully recognized frame."""
    status: str = "ok"
    gesture: str
    confidence: float
    gloss: List[str]
    animations: List[AnimationKey]
