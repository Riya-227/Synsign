"""
ISL Translation Engine

Converts between standard English (Subject-Verb-Object) and 
Indian Sign Language gloss sequences (Time-Subject-Object-Verb).
"""

from typing import List, Tuple

class ISLTranslator:
    """
    Engine for translating ISL glosses into English and vice versa.
    Uses rule-based heuristics for TSOV -> SVO reordering.
    """
    
    # Common ISL time markers and verbs for simple heuristic parsing
    TIME_WORDS = {"YESTERDAY", "TODAY", "TOMORROW", "MORNING", "EVENING", "NIGHT", "NOW", "LATER"}
    VERBS = {"GO", "EAT", "WANT", "LIKE", "PLAY", "SEE", "HAVE", "AM", "IS", "ARE", "WORK", "SLEEP", "HELP"}

    def gloss_to_english(self, gloss_sequence: List[str]) -> Tuple[str, float]:
        """
        Translates an ISL gloss sequence to an English sentence.
        
        Assumes ISL structure: Time - Subject - Object - Verb
        Outputs English structure: Time - Subject - Verb - Object
        
        Returns a tuple of (translated_text, confidence_score).
        """
        if not gloss_sequence:
            return "", 0.0

        time_tokens = []
        subject_tokens = []
        verb_tokens = []
        object_tokens = []
        
        for token in gloss_sequence:
            upper_token = token.upper()
            if upper_token in self.TIME_WORDS:
                time_tokens.append(token.lower())
            elif upper_token in self.VERBS:
                verb_tokens.append(token.lower())
            else:
                # If we haven't seen a verb yet, assume it's subject
                # If we already have a subject and no verb, still subject (multi-word subject)
                # But in a TSOV structure, Object comes BEFORE Verb.
                # So if it's not a Time word or Verb, it could be Subject or Object.
                # Let's put the first non-time/non-verb token as Subject, and subsequent as Object.
                if not subject_tokens:
                    subject_tokens.append(token.lower())
                else:
                    object_tokens.append(token.lower())
                    
        # Reconstruct into English SVO
        # If there's no verb found, just keep the original order to avoid mangling
        if not verb_tokens:
            english_tokens = [t.lower() for t in gloss_sequence]
            confidence = 0.50
        else:
            english_tokens = time_tokens + subject_tokens + verb_tokens + object_tokens
            confidence = 0.85 if subject_tokens else 0.70
            
        translated = " ".join(english_tokens).strip()
        
        # Capitalize first letter and add punctuation
        if translated:
            translated = translated.capitalize() + "."
            
        return translated, confidence
