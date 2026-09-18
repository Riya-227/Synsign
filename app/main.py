"""
SynSign Backend — FastAPI Application Entrypoint

This module initializes the FastAPI application instance, configures
middleware (CORS, logging), and registers all API routers from the
decoupled service modules.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.models.user import User  # Ensures User model is registered with Base
from app.services.history.router import router as history_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Indian Sign Language Recognition & Translation API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# Database Initialization
# ---------------------------------------------------------------------------
# Automatically creates SQLite tables on startup if they don't exist yet
Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <-- Yahan update kiya gaya hai CORS block rokne ke liye
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routers — imported from decoupled service modules
# ---------------------------------------------------------------------------
from app.services.auth.router import router as auth_router          # noqa: E402
from app.services.gesture.router import router as gesture_router    # noqa: E402
from app.services.speech.router import router as speech_router      # noqa: E402
from app.services.translation.router import router as translation_router  # noqa: E402
from app.services.dictionary.router import router as dictionary_router    # noqa: E402
from app.services.pipeline.router import router as pipeline_router        # noqa: E402

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(gesture_router, prefix="/api/v1/gesture", tags=["Gesture Recognition"])
app.include_router(speech_router, prefix="/api/v1/speech", tags=["Speech"])
app.include_router(translation_router, prefix="/api/v1/translate", tags=["Translation"])
app.include_router(dictionary_router, prefix="/api/v1/dictionary", tags=["Dictionary"])
app.include_router(pipeline_router, prefix="/api/v1/pipeline", tags=["Pipeline"])
app.include_router(history_router, prefix="/api/v1/history", tags=["History"])

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["System"])
async def health_check():
    """Returns service health status."""
    return {"status": "healthy", "version": settings.VERSION}