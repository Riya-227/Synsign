"""
Speech Router

Endpoints:
  POST /tts   — Convert text to speech audio (returns WAV/MP3)
  POST /stt   — Convert uploaded audio to text transcription
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import StreamingResponse

from app.services.speech.service import SpeechService

router = APIRouter()
speech_service = SpeechService()


@router.post("/tts")
async def text_to_speech(text: str, language: str = "en"):
    """Convert input text to speech audio and return as a streaming response."""
    audio_stream = speech_service.synthesize(text=text, language=language)
    if audio_stream is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="TTS synthesis failed",
        )
    return StreamingResponse(audio_stream, media_type="audio/mpeg")


@router.post("/stt")
async def speech_to_text(file: UploadFile = File(...)):
    """Transcribe uploaded audio to text."""
    contents = await file.read()
    transcription = await speech_service.transcribe(audio_bytes=contents)
    if transcription is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not transcribe audio",
        )
    return {"transcription": transcription}
