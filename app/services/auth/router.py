"""
Authentication Router

Exposes REST endpoints for user registration, login, Google OAuth,
and token/profile verification.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.core.database import get_db
from app.services.auth.service import AuthService

router = APIRouter()
auth_service = AuthService()


class UserRegisterSchema(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class GoogleAuthSchema(BaseModel):
    email: EmailStr
    full_name: str
    google_id: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegisterSchema, db: Session = Depends(get_db)):
    """Register a new user account (supports both /register and /signup)."""
    user = auth_service.register(db, payload)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered."
        )
    return {"message": "User registered successfully", "username": user.username}


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate standard user and return JWT token pair."""
    tokens = auth_service.authenticate(
        db=db,
        username=form_data.username,
        password=form_data.password,
    )
    if not tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return tokens


@router.post("/google")
async def google_auth(payload: GoogleAuthSchema, db: Session = Depends(get_db)):
    """Authenticate or register user via Google OAuth."""
    tokens = auth_service.authenticate_or_create_google_user(
        db=db,
        email=payload.email,
        full_name=payload.full_name,
        google_id=payload.google_id
    )
    if not tokens:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google authentication failed."
        )
    return tokens


@router.get("/me")
async def get_current_user_profile(user = Depends(auth_service.get_current_user)):
    """Return the profile details of the currently authenticated user."""
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "is_active": user.is_active
    }