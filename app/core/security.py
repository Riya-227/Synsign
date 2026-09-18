"""
Security Utilities

Password hashing via bcrypt (direct) and JWT token creation / verification
using python-jose.  Supports both access tokens and refresh tokens with
distinct expiry windows.

Uses bcrypt directly (not passlib) for compatibility with bcrypt >= 5.0,
which enforces a strict 72-byte password limit that breaks passlib's
internal wrap-bug detection.
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Literal

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

# ---------------------------------------------------------------------------
# Password hashing (bcrypt direct)
# ---------------------------------------------------------------------------

def hash_password(plain: str) -> str:
    """
    Return a bcrypt hash of the plain-text password.

    Passwords are truncated to 72 bytes (bcrypt's limit) before hashing
    to avoid ValueError on bcrypt >= 5.0.
    """
    pwd_bytes = plain.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain-text password against its bcrypt hash."""
    pwd_bytes = plain.encode("utf-8")[:72]
    hashed_bytes = hashed.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)


# ---------------------------------------------------------------------------
# JWT tokens
# ---------------------------------------------------------------------------
def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a signed JWT access token.

    The token embeds a ``"type": "access"`` claim to distinguish it
    from refresh tokens during validation.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access", "jti": uuid.uuid4().hex})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a signed JWT refresh token.

    Refresh tokens have a longer lifetime (7 days by default) and carry
    a ``"type": "refresh"`` claim.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({"exp": expire, "type": "refresh", "jti": uuid.uuid4().hex})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(
    token: str,
    expected_type: Literal["access", "refresh"] = "access",
) -> Optional[dict]:
    """
    Decode and validate a JWT token.

    Returns the payload dict if the token is valid and its ``type`` claim
    matches *expected_type*, otherwise returns ``None``.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        # Enforce token type to prevent refresh tokens being used as access tokens
        if payload.get("type") != expected_type:
            return None
        return payload
    except JWTError:
        return None
