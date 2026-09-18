"""
Dictionary Schemas
"""
from typing import List, Optional
from pydantic import BaseModel, Field

class ISLEntry(BaseModel):
    id: str = Field(..., description="Unique identifier for the sign")
    word: str = Field(..., description="English word or phrase for the sign")
    category: str = Field(..., description="Grammatical or semantic category (e.g. noun, greeting)")
    video_url: Optional[str] = Field(None, description="URL to a video demonstration of the sign")
    description: str = Field(..., description="Textual description of the sign's movement")
    landmark_template: Optional[List[float]] = Field(None, description="Flattened 63-element 3D landmark array for DTW matching")

class AutocompleteResponse(BaseModel):
    query: str
    suggestions: List[str]

class DictionarySearchResponse(BaseModel):
    query: str
    results: List[ISLEntry]
    count: int

class DictionaryListResponse(BaseModel):
    signs: List[ISLEntry]
    skip: int
    limit: int
    total: int
