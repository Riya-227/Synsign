"""
Translation Pydantic Schemas
"""

from pydantic import BaseModel, Field
from typing import List

class TranslationRequest(BaseModel):
    """Request schema for translating ISL gloss to English."""
    glosses: List[str] = Field(
        ..., 
        min_length=1, 
        description="A sequence of ISL gloss tokens (e.g. ['YESTERDAY', 'I', 'APPLE', 'EAT'])"
    )

class TranslationResponse(BaseModel):
    """Response schema for English translation."""
    text: str = Field(..., description="The translated English sentence.")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score of the translation.")
