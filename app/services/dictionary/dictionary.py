"""
ISL Dictionary Engine

High-speed in-memory lookup index for ISL signs, backed by a persistent
SQLite database for durability.
"""

import sqlite3
import json
import os
from typing import List, Optional, Dict, Any

from app.schemas.dictionary import ISLEntry
from app.core.config import settings

DB_PATH = "synsign_dict.db"

_SEED_SIGNS = [
    {"id": "hello", "word": "Hello", "category": "greeting", "video_url": "https://example.com/hello.mp4", "description": "Open palm wave near the face.", "landmark_template": None},
    {"id": "thank_you", "word": "Thank You", "category": "greeting", "video_url": "https://example.com/thankyou.mp4", "description": "Touch chin with fingertips and move hand forward.", "landmark_template": None},
    {"id": "please", "word": "Please", "category": "courtesy", "video_url": "https://example.com/please.mp4", "description": "Flat hand circles on chest.", "landmark_template": None},
    {"id": "yes", "word": "Yes", "category": "response", "video_url": "https://example.com/yes.mp4", "description": "Fist nods downward like a head nod.", "landmark_template": None},
    {"id": "no", "word": "No", "category": "response", "video_url": "https://example.com/no.mp4", "description": "Index and middle finger snap together with thumb.", "landmark_template": None},
]

class DictionaryEngine:
    """
    High-speed in-memory dictionary index with SQLite persistence.
    """
    
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._cache: Dict[str, ISLEntry] = {}
        self._init_db()
        self._load_into_memory()

    def _init_db(self):
        """Create the SQLite schema if it doesn't exist and seed data."""
        is_new = not os.path.exists(self.db_path)
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS isl_dictionary (
                    id TEXT PRIMARY KEY,
                    word TEXT NOT NULL,
                    category TEXT NOT NULL,
                    video_url TEXT,
                    description TEXT NOT NULL,
                    landmark_template TEXT
                )
            ''')
            conn.commit()
            
            # Seed the database if it was just created
            if is_new:
                for sign in _SEED_SIGNS:
                    self._insert_to_db(cursor, sign)
                conn.commit()

    def _insert_to_db(self, cursor, sign_data: dict):
        landmarks = json.dumps(sign_data.get("landmark_template")) if sign_data.get("landmark_template") else None
        cursor.execute('''
            INSERT OR IGNORE INTO isl_dictionary (id, word, category, video_url, description, landmark_template)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            sign_data["id"],
            sign_data["word"],
            sign_data["category"],
            sign_data.get("video_url"),
            sign_data["description"],
            landmarks
        ))

    def _load_into_memory(self):
        """Load all SQLite records into a high-speed memory dictionary."""
        self._cache.clear()
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM isl_dictionary')
            rows = cursor.fetchall()
            for row in rows:
                landmarks = json.loads(row["landmark_template"]) if row["landmark_template"] else None
                entry = ISLEntry(
                    id=row["id"],
                    word=row["word"],
                    category=row["category"],
                    video_url=row["video_url"],
                    description=row["description"],
                    landmark_template=landmarks
                )
                self._cache[entry.id] = entry

    def get(self, sign_id: str) -> Optional[ISLEntry]:
        """O(1) in-memory lookup by sign ID."""
        return self._cache.get(sign_id)

    def search(self, query: str) -> List[ISLEntry]:
        """Fuzzy substring search across word and description."""
        q = query.lower()
        return [
            entry for entry in self._cache.values()
            if q in entry.word.lower() or q in entry.description.lower()
        ]
        
    def autocomplete(self, query: str) -> List[str]:
        """High-speed prefix/substring matching for auto-completion."""
        q = query.lower()
        suggestions = []
        for entry in self._cache.values():
            if entry.word.lower().startswith(q):
                suggestions.append(entry.word)
                if len(suggestions) >= 10:
                    break
        return suggestions

    def list_all(self, skip: int = 0, limit: int = 20, category: Optional[str] = None) -> List[ISLEntry]:
        """Return a paginated list of signs, optionally filtered by category."""
        results = list(self._cache.values())
        if category:
            cat_lower = category.lower()
            results = [e for e in results if e.category.lower() == cat_lower]
        
        return results[skip: skip + limit]

    def total_count(self, category: Optional[str] = None) -> int:
        """Count of dictionary entries."""
        if category:
            cat_lower = category.lower()
            return sum(1 for e in self._cache.values() if e.category.lower() == cat_lower)
        return len(self._cache)
