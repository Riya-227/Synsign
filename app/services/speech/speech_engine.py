"""
Speech Engine

Bidirectional speech processing module for Text-to-Speech (TTS)
and Speech-to-Text (STT).
"""

import io
import asyncio
import logging
from typing import Optional
from gtts import gTTS

logger = logging.getLogger(__name__)

def text_to_speech(text: str, lang: str = 'en') -> bytes:
    """
    Convert text into spoken audio using gTTS.
    Returns the MP3 audio content as a byte buffer.
    """
    try:
        tts = gTTS(text=text, lang=lang)
        buffer = io.BytesIO()
        tts.write_to_fp(buffer)
        return buffer.getvalue()
    except Exception as e:
        logger.error(f"TTS synthesis failed: {e}")
        return b""

async def process_audio(audio_bytes: bytes) -> str:
    """
    Asynchronous wrapper for processing audio capture.
    This simulates an STT (Speech-to-Text) pipeline (e.g., Whisper).
    """
    if not audio_bytes:
        return ""
    
    # Simulate async model inference time
    await asyncio.sleep(0.05)
    
    # Placeholder STT return value
    return "[STT integration pending — audio processed asynchronously]"

class SpeechEngine:
    """
    Facade for the bidirectional speech module, providing methods
    for FastAPI endpoints.
    """
    
    def synthesize(self, text: str, language: str = "en") -> Optional[io.BytesIO]:
        """
        Convert text to speech and return as an in-memory byte stream.
        Useful for FastAPI StreamingResponse.
        """
        audio_bytes = text_to_speech(text, language)
        if not audio_bytes:
            return None
        return io.BytesIO(audio_bytes)
        
    async def transcribe(self, audio_bytes: bytes) -> Optional[str]:
        """
        Transcribe audio bytes to text asynchronously.
        """
        result = await process_audio(audio_bytes)
        if not result:
            return None
        return result
