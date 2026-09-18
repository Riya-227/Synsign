"""
Translation Router

Endpoints:
  POST /text-to-isl   — Convert English text to ISL gloss sequence
  POST /gloss-to-anim — Map ISL gloss sequence to avatar animation keys
"""

from fastapi import APIRouter, HTTPException, status

from app.services.translation.service import TranslationService
from app.schemas.translation import TranslationRequest, TranslationResponse

router = APIRouter()
translation_service = TranslationService()

@router.post(
    "/translate", 
    response_model=TranslationResponse,
    summary="Translate ISL gloss sequence to English syntax"
)
async def translate_isl_to_english(payload: TranslationRequest):
    """
    Translates an ISL gloss sequence (Time-Subject-Object-Verb) into a standard 
    English sentence (Subject-Verb-Object) and provides a confidence score.
    """
    result = translation_service.gloss_to_english(payload.glosses)
    return TranslationResponse(**result)

@router.post("/text-to-isl")
async def text_to_isl(text: str):
    """Translate English text into an ISL gloss sequence."""
    result = translation_service.text_to_gloss(text)
    return {"input": text, "gloss": result}


@router.post("/gloss-to-anim")
async def gloss_to_animation(gloss: list[str]):
    """Map an ISL gloss sequence to avatar animation keys."""
    animations = translation_service.gloss_to_animation(gloss)
    return {"gloss": gloss, "animations": animations}
