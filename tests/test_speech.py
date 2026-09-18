"""
Speech Recognition and Synthesis Test Suite

Unit tests for Feature 3: Speech processing module, covering:
1. Text-to-Speech (TTS) synthesis mocking network calls.
2. Speech-to-Text (STT) asynchronous processing.
"""

import io
import pytest
from unittest.mock import patch, MagicMock

from app.services.speech.speech_engine import text_to_speech, process_audio, SpeechEngine
from app.services.speech.service import SpeechService

# ═══════════════════════════════════════════════════════════════════════════
# 1. TEXT-TO-SPEECH (TTS) TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestTextToSpeech:
    """Tests for TTS synthesis mocking the gTTS network call."""

    @patch("app.services.speech.speech_engine.gTTS")
    def test_text_to_speech_success(self, mock_gtts):
        # Setup mock behavior
        mock_instance = MagicMock()
        mock_gtts.return_value = mock_instance
        
        def mock_write_to_fp(fp):
            fp.write(b"mocked_audio_data")
            
        mock_instance.write_to_fp.side_effect = mock_write_to_fp

        result = text_to_speech("hello world", "en")
        
        assert result == b"mocked_audio_data"
        mock_gtts.assert_called_once_with(text="hello world", lang="en")
        mock_instance.write_to_fp.assert_called_once()

    @patch("app.services.speech.speech_engine.gTTS")
    def test_text_to_speech_failure(self, mock_gtts):
        # Simulate network or API failure
        mock_gtts.side_effect = Exception("API error")

        result = text_to_speech("hello world", "en")
        
        assert result == b""

# ═══════════════════════════════════════════════════════════════════════════
# 2. SPEECH-TO-TEXT (STT) TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestSpeechToText:
    """Tests for asynchronous STT processing."""

    @pytest.mark.asyncio
    async def test_process_audio_success(self):
        dummy_audio = b"dummy_audio_bytes"
        result = await process_audio(dummy_audio)
        
        assert "audio processed asynchronously" in result

    @pytest.mark.asyncio
    async def test_process_audio_empty_input(self):
        result = await process_audio(b"")
        assert result == ""

# ═══════════════════════════════════════════════════════════════════════════
# 3. SPEECH ENGINE / SERVICE TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestSpeechEngine:
    """Tests for the SpeechEngine facade."""

    @patch("app.services.speech.speech_engine.text_to_speech")
    def test_synthesize(self, mock_tts):
        mock_tts.return_value = b"engine_audio_data"
        
        engine = SpeechEngine()
        result_stream = engine.synthesize("test", "en")
        
        assert isinstance(result_stream, io.BytesIO)
        assert result_stream.getvalue() == b"engine_audio_data"
        mock_tts.assert_called_once_with("test", "en")

    @patch("app.services.speech.speech_engine.text_to_speech")
    def test_synthesize_failure(self, mock_tts):
        mock_tts.return_value = b""
        
        engine = SpeechEngine()
        result_stream = engine.synthesize("test", "en")
        
        assert result_stream is None

    @pytest.mark.asyncio
    @patch("app.services.speech.speech_engine.process_audio")
    async def test_transcribe(self, mock_process):
        mock_process.return_value = "transcribed_text"
        
        engine = SpeechEngine()
        result = await engine.transcribe(b"some_audio")
        
        assert result == "transcribed_text"
        mock_process.assert_called_once_with(b"some_audio")

    @pytest.mark.asyncio
    @patch("app.services.speech.speech_engine.process_audio")
    async def test_transcribe_failure(self, mock_process):
        mock_process.return_value = ""
        
        engine = SpeechEngine()
        result = await engine.transcribe(b"some_audio")
        
        assert result is None
