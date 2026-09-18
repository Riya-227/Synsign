"""
Dictionary Service Wrapper (service.py)

Re-exports the DictionaryEngine from app.services.dictionary.dictionary as
DictionaryService to maintain architectural compatibility with existing routers.
"""

from app.services.dictionary.dictionary import DictionaryEngine as DictionaryService

__all__ = ["DictionaryService"]
