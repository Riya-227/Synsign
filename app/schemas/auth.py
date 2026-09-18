"""
Authentication Pydantic Schemas

Request and response models for the auth service.  All input validation
(min-length, email format, etc.) is handled here so that routers and
service logic stay clean.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator
import re


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------
class UserSignup(BaseModel):
    """Payload for POST /signup."""
    username: str = Field(
        ...,
        min_length=3,
        max_length=32,
        description="Unique username (3-32 chars, alphanumeric + underscores)",
    )
    email: str = Field(
        ...,
        min_length=5,
        max_length=255,
        description="Valid email address",
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password (min 8 chars, must contain upper, lower, and digit)",
    )
    full_name: Optional[str] = Field(
        None,
        max_length=100,
        description="User's display name",
    )

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("Username must be alphanumeric (underscores allowed)")
        return v.lower()

    @field_validator("email")
    @classmethod
    def email_valid(cls, v: str) -> str:
        pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(pattern, v):
            raise ValueError("Invalid email format")
        return v.lower()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLogin(BaseModel):
    """Payload for POST /login (JSON body alternative to OAuth2 form)."""
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------
class UserResponse(BaseModel):
    """Public user profile returned by endpoints."""
    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    is_active: bool = True
    created_at: datetime


class TokenResponse(BaseModel):
    """JWT token pair returned after successful authentication."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(
        ...,
        description="Access token lifetime in seconds",
    )


class TokenRefreshRequest(BaseModel):
    """Payload for POST /refresh."""
    refresh_token: str


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    username: str
