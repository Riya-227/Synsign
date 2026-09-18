"""
Translation History Model

Defines the database table schema for tracking user translation and recognition logs.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base

class TranslationHistory(Base):
    __tablename__ = "translation_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(String, nullable=False)
    type = Column(String, nullable=False)  # "Text to ISL", "Live Gesture", "Text-to-Speech", "Speech to Text"
    status = Column(String, default="Success")
    confidence = Column(String, default="98.0%")
    created_at = Column(DateTime, default=datetime.utcnow)