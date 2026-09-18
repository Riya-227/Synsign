"""
Application Configuration

Centralized settings loaded from environment variables with sensible
defaults. Uses Pydantic's BaseSettings for automatic .env file parsing
and type coercion.
"""

from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List


class Settings(BaseSettings):
    """Global application settings sourced from environment variables."""

    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # ── Project Metadata ──────────────────────────────────────────────────
    PROJECT_NAME: str = "SynSign API"
    VERSION: str = "0.1.0"
    DEBUG: bool = True

    # ── Security & JWT ────────────────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ──────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # ── Database ──────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./synsign.db"

    # ── Model Paths ───────────────────────────────────────────────────────
    GESTURE_MODEL_PATH: str = "app/models/isl_gesture_model.pth"

    # ── Speech ────────────────────────────────────────────────────────────
    TTS_LANGUAGE: str = "en"


settings = Settings()

