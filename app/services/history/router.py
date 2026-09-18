"""
History Router

Exposes REST endpoints for logging user translations/gestures, fetching audit logs,
and clearing history.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.models.history import TranslationHistory
from app.services.auth.service import AuthService

router = APIRouter()
auth_service = AuthService()


class HistoryCreateSchema(BaseModel):
    text: str
    type: str
    status: Optional[str] = "Success"
    confidence: Optional[str] = "98.0%"


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_history_log(
    payload: HistoryCreateSchema,
    db: Session = Depends(get_db),
    current_user = Depends(auth_service.get_current_user)
):
    """Save a translation or recognition record for the logged-in user."""
    log_entry = TranslationHistory(
        user_id=current_user.id,
        text=payload.text,
        type=payload.type,
        status=payload.status,
        confidence=payload.confidence
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return {"message": "Log saved successfully", "id": log_entry.id}


@router.get("/")
async def get_history_logs(
    db: Session = Depends(get_db),
    current_user = Depends(auth_service.get_current_user)
):
    """Fetch all history logs for the logged-in user from SQLite."""
    logs = db.query(TranslationHistory).filter(
        TranslationHistory.user_id == current_user.id
    ).order_by(TranslationHistory.created_at.desc()).all()
    
    result = []
    for log in logs:
        time_str = log.created_at.strftime("%b %d, %Y - %H:%M")
        result.append({
            "id": log.id,
            "text": log.text,
            "type": log.type,
            "status": log.status,
            "confidence": log.confidence,
            "time": time_str
        })
    return result


@router.delete("/", status_code=status.HTTP_200_OK)
async def clear_history_logs(
    db: Session = Depends(get_db),
    current_user = Depends(auth_service.get_current_user)
):
    """Clear all history logs for the logged-in user."""
    db.query(TranslationHistory).filter(
        TranslationHistory.user_id == current_user.id
    ).delete()
    db.commit()
    return {"message": "History cleared successfully"}