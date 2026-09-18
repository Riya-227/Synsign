"""
Translation Test Suite (test_translation.py)

Unit tests for Feature 4: ISL Translation API
"""

from fastapi.testclient import TestClient
from app.main import app
from app.services.translation.translator import ISLTranslator

client = TestClient(app)

# ═══════════════════════════════════════════════════════════════════════════
# 1. ISL TRANSLATOR ENGINE TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestISLTranslator:
    def setup_method(self):
        self.translator = ISLTranslator()
        
    def test_gloss_to_english_tsov_to_svo(self):
        # Time - Subject - Object - Verb
        gloss = ["YESTERDAY", "I", "APPLE", "EAT"]
        text, conf = self.translator.gloss_to_english(gloss)
        
        # Expected: Time - Subject - Verb - Object -> "Yesterday i eat apple."
        assert text == "Yesterday i eat apple."
        assert conf > 0.8
        
    def test_gloss_to_english_no_time(self):
        # Subject - Object - Verb
        gloss = ["BOY", "BALL", "PLAY"]
        text, conf = self.translator.gloss_to_english(gloss)
        
        assert text == "Boy play ball."
        assert conf > 0.8
        
    def test_gloss_to_english_no_verb(self):
        # Subject - Object (no verb)
        gloss = ["CAR", "RED"]
        text, conf = self.translator.gloss_to_english(gloss)
        
        # Fallback retains order
        assert text == "Car red."
        assert conf == 0.5
        
    def test_empty_gloss(self):
        text, conf = self.translator.gloss_to_english([])
        assert text == ""
        assert conf == 0.0

# ═══════════════════════════════════════════════════════════════════════════
# 2. API ENDPOINT TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestTranslationEndpoints:
    def test_translate_endpoint(self):
        payload = {"glosses": ["TODAY", "SHE", "BOOK", "WANT"]}
        resp = client.post("/api/v1/translation/translate", json=payload)
        
        assert resp.status_code == 200
        data = resp.json()
        assert data["text"] == "Today she want book."
        assert data["confidence"] > 0.8
        
    def test_translate_endpoint_invalid(self):
        # Empty array fails validation
        payload = {"glosses": []}
        resp = client.post("/api/v1/translation/translate", json=payload)
        assert resp.status_code == 422
