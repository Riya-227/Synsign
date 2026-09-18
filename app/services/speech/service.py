"""
Speech Service Wrapper (service.py)

Re-exports the SpeechEngine from app.services.speech.speech_engine as
SpeechService to maintain architectural compatibility with existing routers.
"""

from app.services.speech.speech_engine import SpeechEngine as SpeechService

__all__ = ["SpeechService"]
