"""
Authentication Service (Database-backed)

Handles business logic for user registration, password verification using native bcrypt,
JWT token generation, token decoding, and database interactions via SQLAlchemy.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
import bcrypt
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.database import get_db

# Security Configurations
SECRET_KEY = "your-super-secret-key-change-in-production"
REFRESH_SECRET_KEY = "your-super-refresh-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


class AuthService:
    def __init__(self):
        pass

    def hash_password(self, password: str) -> str:
        """Hash a password using native bcrypt."""
        pwd_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password using native bcrypt."""
        if not hashed_password:
            return False
        try:
            pwd_bytes = plain_password.encode('utf-8')
            hash_bytes = hashed_password.encode('utf-8')
            return bcrypt.checkpw(pwd_bytes, hash_bytes)
        except ValueError:
            return False

    def create_token_pair(self, username: str) -> Dict[str, Any]:
        """Generate a new access and refresh token pair."""
        access_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        access_token = jwt.encode(
            {"sub": username, "exp": datetime.utcnow() + access_expires},
            SECRET_KEY,
            algorithm=ALGORITHM
        )
        refresh_token = jwt.encode(
            {"sub": username, "exp": datetime.utcnow() + refresh_expires},
            REFRESH_SECRET_KEY,
            algorithm=ALGORITHM
        )
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": int(access_expires.total_seconds())
        }

    def register(self, db: Session, payload) -> Optional[User]:
        """Register a new standard user account in SQLite."""
        existing_user = db.query(User).filter(
            (User.username == payload.username) | (User.email == payload.email)
        ).first()

        if existing_user:
            return None  # Already exists

        hashed_pwd = self.hash_password(payload.password)
        new_user = User(
            username=payload.username,
            email=payload.email,
            full_name=payload.full_name or "",
            hashed_password=hashed_pwd,
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    def authenticate(self, db: Session, username: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate a user via username and password from database."""
        user = db.query(User).filter(User.username == username).first()
        if not user or not self.verify_password(password, user.hashed_password):
            return None
        return self.create_token_pair(username)

    def authenticate_or_create_google_user(self, db: Session, email: str, full_name: str, google_id: str) -> Optional[Dict[str, Any]]:
        """Authenticate or auto-register a Google OAuth user in database."""
        user = db.query(User).filter(User.email == email).first()

        if not user:
            base_username = email.split("@")[0]
            username = base_username
            counter = 1
            while db.query(User).filter(User.username == username).first():
                username = f"{base_username}{counter}"
                counter += 1

            user = User(
                username=username,
                email=email,
                full_name=full_name,
                hashed_password="",  # No local password for OAuth users
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        return self.create_token_pair(user.username)

    def get_user_by_username(self, db: Session, username: str) -> Optional[User]:
        """Fetch user record from database by username."""
        return db.query(User).filter(User.username == username).first()

    def get_current_user(self, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
        """Decode JWT token and return current user from SQLite database."""
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                raise credentials_exception
        except JWTError:
            raise credentials_exception
            
        user = self.get_user_by_username(db, username)
        if user is None:
            raise credentials_exception
        return user