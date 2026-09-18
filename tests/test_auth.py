"""
Authentication Test Suite

Comprehensive tests for the SynSign auth system covering:

  1. Password hashing & verification (bcrypt via passlib)
  2. JWT token creation, decoding, and type enforcement
  3. Pydantic schema validation (username, email, password strength)
  4. API endpoint integration tests:
     - POST /signup   — registration with validation
     - POST /login    — OAuth2 password flow
     - POST /refresh  — token rotation
     - GET  /me       — bearer token dependency injection
  5. Edge cases: duplicates, bad tokens, expired tokens, deactivated accounts

Run with:  pytest tests/test_auth.py -v
"""

import time
from datetime import timedelta

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_access_token,
)
from app.schemas.auth import UserSignup

client = TestClient(app)

# ═══════════════════════════════════════════════════════════════════════════
# 1. PASSWORD HASHING (bcrypt)
# ═══════════════════════════════════════════════════════════════════════════


class TestPasswordHashing:
    """Verify bcrypt hashing and verification via passlib."""

    def test_hash_is_not_plaintext(self):
        hashed = hash_password("MySecure1")
        assert hashed != "MySecure1"
        assert hashed.startswith("$2b$")  # bcrypt identifier

    def test_verify_correct_password(self):
        hashed = hash_password("MySecure1")
        assert verify_password("MySecure1", hashed) is True

    def test_verify_wrong_password(self):
        hashed = hash_password("MySecure1")
        assert verify_password("WrongPass1", hashed) is False

    def test_different_hashes_for_same_password(self):
        """bcrypt uses random salts, so two hashes of the same password differ."""
        h1 = hash_password("MySecure1")
        h2 = hash_password("MySecure1")
        assert h1 != h2
        # Both should still verify
        assert verify_password("MySecure1", h1) is True
        assert verify_password("MySecure1", h2) is True


# ═══════════════════════════════════════════════════════════════════════════
# 2. JWT TOKEN LOGIC
# ═══════════════════════════════════════════════════════════════════════════


class TestJWTTokens:
    """Verify JWT creation, decoding, type enforcement, and expiry."""

    def test_create_and_decode_access_token(self):
        token = create_access_token(data={"sub": "alice"})
        payload = decode_access_token(token, expected_type="access")
        assert payload is not None
        assert payload["sub"] == "alice"
        assert payload["type"] == "access"

    def test_create_and_decode_refresh_token(self):
        token = create_refresh_token(data={"sub": "bob"})
        payload = decode_access_token(token, expected_type="refresh")
        assert payload is not None
        assert payload["sub"] == "bob"
        assert payload["type"] == "refresh"

    def test_access_token_rejected_as_refresh(self):
        """An access token must not be accepted when a refresh token is expected."""
        token = create_access_token(data={"sub": "eve"})
        payload = decode_access_token(token, expected_type="refresh")
        assert payload is None

    def test_refresh_token_rejected_as_access(self):
        """A refresh token must not be accepted when an access token is expected."""
        token = create_refresh_token(data={"sub": "eve"})
        payload = decode_access_token(token, expected_type="access")
        assert payload is None

    def test_expired_access_token_returns_none(self):
        token = create_access_token(
            data={"sub": "temp"},
            expires_delta=timedelta(seconds=-1),  # already expired
        )
        payload = decode_access_token(token, expected_type="access")
        assert payload is None

    def test_invalid_token_string_returns_none(self):
        payload = decode_access_token("not.a.valid.jwt", expected_type="access")
        assert payload is None

    def test_token_contains_expiry_claim(self):
        token = create_access_token(data={"sub": "test"})
        payload = decode_access_token(token, expected_type="access")
        assert "exp" in payload


# ═══════════════════════════════════════════════════════════════════════════
# 3. PYDANTIC SCHEMA VALIDATION
# ═══════════════════════════════════════════════════════════════════════════


class TestSchemaValidation:
    """Verify Pydantic field validators on UserSignup."""

    def test_valid_signup_payload(self):
        user = UserSignup(
            username="john_doe",
            email="john@example.com",
            password="Secure1pass",
            full_name="John Doe",
        )
        assert user.username == "john_doe"
        assert user.email == "john@example.com"

    def test_username_normalized_to_lowercase(self):
        user = UserSignup(
            username="JohnDoe",
            email="j@example.com",
            password="Secure1pass",
        )
        assert user.username == "johndoe"

    def test_email_normalized_to_lowercase(self):
        user = UserSignup(
            username="test_user",
            email="USER@Example.COM",
            password="Secure1pass",
        )
        assert user.email == "user@example.com"

    def test_username_rejects_special_chars(self):
        with pytest.raises(ValueError):
            UserSignup(
                username="bad user!",
                email="x@example.com",
                password="Secure1pass",
            )

    def test_username_rejects_too_short(self):
        with pytest.raises(ValueError):
            UserSignup(
                username="ab",
                email="x@example.com",
                password="Secure1pass",
            )

    def test_email_rejects_invalid_format(self):
        with pytest.raises(ValueError):
            UserSignup(
                username="valid_user",
                email="not-an-email",
                password="Secure1pass",
            )

    def test_password_requires_uppercase(self):
        with pytest.raises(ValueError):
            UserSignup(
                username="valid_user",
                email="x@example.com",
                password="alllower1",
            )

    def test_password_requires_lowercase(self):
        with pytest.raises(ValueError):
            UserSignup(
                username="valid_user",
                email="x@example.com",
                password="ALLUPPER1",
            )

    def test_password_requires_digit(self):
        with pytest.raises(ValueError):
            UserSignup(
                username="valid_user",
                email="x@example.com",
                password="NoDigitsHere",
            )

    def test_password_rejects_too_short(self):
        with pytest.raises(ValueError):
            UserSignup(
                username="valid_user",
                email="x@example.com",
                password="Ab1",  # only 3 chars
            )


# ═══════════════════════════════════════════════════════════════════════════
# 4. API ENDPOINT INTEGRATION TESTS
# ═══════════════════════════════════════════════════════════════════════════


class TestSignupEndpoint:
    """POST /api/v1/auth/signup"""

    def test_signup_success(self):
        resp = client.post("/api/v1/auth/signup", json={
            "username": "signup_user",
            "email": "signup@test.com",
            "password": "TestPass1",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["message"] == "Account created successfully"
        assert data["username"] == "signup_user"

    def test_signup_with_full_name(self):
        resp = client.post("/api/v1/auth/signup", json={
            "username": "named_user",
            "email": "named@test.com",
            "password": "TestPass1",
            "full_name": "Named User",
        })
        assert resp.status_code == 201

    def test_signup_duplicate_username(self):
        client.post("/api/v1/auth/signup", json={
            "username": "dup_user",
            "email": "dup1@test.com",
            "password": "TestPass1",
        })
        resp = client.post("/api/v1/auth/signup", json={
            "username": "dup_user",
            "email": "dup2@test.com",
            "password": "TestPass1",
        })
        assert resp.status_code == 409

    def test_signup_duplicate_email(self):
        client.post("/api/v1/auth/signup", json={
            "username": "email_user_1",
            "email": "same@test.com",
            "password": "TestPass1",
        })
        resp = client.post("/api/v1/auth/signup", json={
            "username": "email_user_2",
            "email": "same@test.com",
            "password": "TestPass1",
        })
        assert resp.status_code == 409

    def test_signup_invalid_payload_returns_422(self):
        resp = client.post("/api/v1/auth/signup", json={
            "username": "x",  # too short
            "email": "bad",
            "password": "weak",
        })
        assert resp.status_code == 422


class TestLoginEndpoint:
    """POST /api/v1/auth/login (OAuth2 password form)"""

    @pytest.fixture(autouse=True)
    def _register_user(self):
        """Ensure a test user exists before each login test."""
        client.post("/api/v1/auth/signup", json={
            "username": "login_user",
            "email": "login@test.com",
            "password": "LoginPass1",
        })

    def test_login_success(self):
        resp = client.post("/api/v1/auth/login", data={
            "username": "login_user",
            "password": "LoginPass1",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] > 0

    def test_login_wrong_password(self):
        resp = client.post("/api/v1/auth/login", data={
            "username": "login_user",
            "password": "WrongPass1",
        })
        assert resp.status_code == 401
        assert resp.json()["detail"] == "Incorrect username or password"

    def test_login_nonexistent_user(self):
        resp = client.post("/api/v1/auth/login", data={
            "username": "ghost_user",
            "password": "Whatever1",
        })
        assert resp.status_code == 401


class TestRefreshEndpoint:
    """POST /api/v1/auth/refresh"""

    def _get_tokens(self) -> dict:
        """Helper: register + login and return the token response."""
        client.post("/api/v1/auth/signup", json={
            "username": "refresh_user",
            "email": "refresh@test.com",
            "password": "RefreshPass1",
        })
        resp = client.post("/api/v1/auth/login", data={
            "username": "refresh_user",
            "password": "RefreshPass1",
        })
        return resp.json()

    def test_refresh_returns_new_tokens(self):
        tokens = self._get_tokens()
        resp = client.post("/api/v1/auth/refresh", json={
            "refresh_token": tokens["refresh_token"],
        })
        assert resp.status_code == 200
        new = resp.json()
        assert "access_token" in new
        assert "refresh_token" in new
        # New tokens should be different from originals
        assert new["access_token"] != tokens["access_token"]

    def test_refresh_rejects_access_token(self):
        """An access token must not work as a refresh token."""
        tokens = self._get_tokens()
        resp = client.post("/api/v1/auth/refresh", json={
            "refresh_token": tokens["access_token"],  # wrong token type
        })
        assert resp.status_code == 401

    def test_refresh_rejects_garbage_token(self):
        resp = client.post("/api/v1/auth/refresh", json={
            "refresh_token": "garbage.token.string",
        })
        assert resp.status_code == 401


class TestMeEndpoint:
    """GET /api/v1/auth/me"""

    def _get_access_token(self) -> str:
        """Helper: register + login and return just the access token."""
        client.post("/api/v1/auth/signup", json={
            "username": "me_user",
            "email": "me@test.com",
            "password": "MePass123",
        })
        resp = client.post("/api/v1/auth/login", data={
            "username": "me_user",
            "password": "MePass123",
        })
        return resp.json()["access_token"]

    def test_me_returns_profile(self):
        token = self._get_access_token()
        resp = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["username"] == "me_user"
        assert data["email"] == "me@test.com"
        assert "id" in data
        assert "created_at" in data
        assert data["is_active"] is True
        # Password must never be exposed
        assert "hashed_password" not in data
        assert "password" not in data

    def test_me_rejects_missing_token(self):
        resp = client.get("/api/v1/auth/me")
        assert resp.status_code == 401

    def test_me_rejects_invalid_token(self):
        resp = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid.token.here"},
        )
        assert resp.status_code == 401

    def test_me_rejects_refresh_token_as_bearer(self):
        """A refresh token must not grant access to protected endpoints."""
        client.post("/api/v1/auth/signup", json={
            "username": "me_user_rt",
            "email": "me_rt@test.com",
            "password": "MePass123",
        })
        resp = client.post("/api/v1/auth/login", data={
            "username": "me_user_rt",
            "password": "MePass123",
        })
        refresh = resp.json()["refresh_token"]
        resp = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {refresh}"},
        )
        assert resp.status_code == 401
