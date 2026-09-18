"""
Smoke tests for the SynSign API.

Validates that all routers are mounted, the health endpoint responds,
and basic service operations succeed.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestHealthCheck:
    def test_health_returns_200(self):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"


class TestAuthEndpoints:
    def test_register_and_login(self):
        # Signup
        resp = client.post("/api/v1/auth/signup", json={"username": "testuser_api", "email": "testapi@example.com", "password": "SecretPass123"})
        assert resp.status_code == 201

        # Login
        resp = client.post("/api/v1/auth/login", data={"username": "testuser_api", "password": "SecretPass123"})
        assert resp.status_code == 200
        assert "access_token" in resp.json()


class TestDictionaryEndpoints:
    def test_list_signs(self):
        resp = client.get("/api/v1/dictionary/")
        assert resp.status_code == 200
        assert len(resp.json()["signs"]) > 0

    def test_search_signs(self):
        resp = client.get("/api/v1/dictionary/search", params={"q": "hello"})
        assert resp.status_code == 200
        assert resp.json()["count"] >= 1

    def test_get_sign_by_id(self):
        resp = client.get("/api/v1/dictionary/hello")
        assert resp.status_code == 200
        assert resp.json()["word"] == "Hello"


class TestGestureEndpoints:
    def test_list_labels(self):
        resp = client.get("/api/v1/gesture/labels")
        assert resp.status_code == 200
        labels = resp.json()["labels"]
        assert len(labels) == 26  # A-Z


class TestTranslationEndpoints:
    def test_text_to_isl(self):
        resp = client.post("/api/v1/translation/text-to-isl", params={"text": "I want water"})
        assert resp.status_code == 200
        assert len(resp.json()["gloss"]) > 0


class TestPipelineEndpoints:
    def test_pipeline_status(self):
        resp = client.get("/api/v1/pipeline/status")
        assert resp.status_code == 200
        assert resp.json()["pipeline"] == "ready"
