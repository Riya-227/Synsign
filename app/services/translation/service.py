"""
ISL Translation Service Logic

Converts English text into Indian Sign Language (ISL) gloss notation
and maps gloss tokens to avatar animation identifiers.

ISL gloss generation uses rule-based reordering (Subject-Object-Verb)
and stop-word removal as a baseline.  Replace with a trained
seq2seq model for production quality.
"""

from typing import List
from app.services.translation.translator import ISLTranslator

# Common English stop words to drop during gloss conversion
_STOP_WORDS = {
    "is", "am", "are", "was", "were", "the", "a", "an", "to", "of",
    "in", "on", "at", "for", "and", "or", "but", "with", "this", "that",
}


class TranslationService:
    """English → ISL gloss → animation key mapping."""
    
    def __init__(self):
        self.translator = ISLTranslator()

    def text_to_gloss(self, text: str) -> List[str]:
        """
        Naive rule-based English-to-ISL-gloss converter.

        Steps:
          1. Tokenize and lowercase
          2. Remove stop words
          3. Reorder to approximate SOV structure

        Returns a list of gloss tokens.
        """
        tokens = text.lower().split()
        filtered = [t for t in tokens if t not in _STOP_WORDS]
        # Simple SOV heuristic: move the last word (verb) to end
        if len(filtered) > 2:
            filtered = filtered[1:] + [filtered[0]]
        return [t.upper() for t in filtered]
        
    def gloss_to_english(self, gloss_sequence: List[str]) -> dict:
        """
        Translates ISL gloss sequence to standard English.
        """
        text, confidence = self.translator.gloss_to_english(gloss_sequence)
        return {"text": text, "confidence": confidence}

    def gloss_to_animation(self, gloss: List[str]) -> List[dict]:
        """
        Map each gloss token to an avatar animation descriptor.

        Returns a sequence of animation keys that a front-end avatar
        renderer can consume.
        """
        animations = []
        for token in gloss:
            animations.append({
                "token": token,
                "animation_id": f"anim_{token.lower()}",
                "duration_ms": 800,
            })
        return animations
