"""
Dictionary Router

Endpoints:
  GET  /search       — Search the ISL dictionary by keyword
  GET  /autocomplete — Fast prefix matching for search suggestions
  GET  /             — List all available signs (paginated, with optional category filter)
  GET  /{sign_id}    — Retrieve detailed info for a specific sign
"""

from typing import Optional
from fastapi import APIRouter, Query, HTTPException, status

from app.services.dictionary.service import DictionaryService
from app.schemas.dictionary import (
    ISLEntry,
    DictionarySearchResponse,
    DictionaryListResponse,
    AutocompleteResponse
)

router = APIRouter()
dictionary_service = DictionaryService()


@router.get("/search", response_model=DictionarySearchResponse)
async def search_signs(q: str = Query(..., min_length=1, description="Search keyword")):
    """Search the ISL dictionary by keyword (fuzzy substring match)."""
    results = dictionary_service.search(q)
    return {"query": q, "results": results, "count": len(results)}


@router.get("/autocomplete", response_model=AutocompleteResponse)
async def autocomplete(q: str = Query(..., min_length=1, description="Prefix to match")):
    """High-speed prefix matching for search auto-completion."""
    suggestions = dictionary_service.autocomplete(q)
    return {"query": q, "suggestions": suggestions}


@router.get("/", response_model=DictionaryListResponse)
async def list_signs(
    skip: int = Query(0, ge=0), 
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None, description="Filter by category")
):
    """List all ISL signs with pagination and optional category filtering."""
    signs = dictionary_service.list_all(skip=skip, limit=limit, category=category)
    total = dictionary_service.total_count(category=category)
    return {"signs": signs, "skip": skip, "limit": limit, "total": total}


@router.get("/{sign_id}", response_model=ISLEntry)
async def get_sign(sign_id: str):
    """Retrieve detailed information for a specific ISL sign."""
    sign = dictionary_service.get(sign_id)
    if sign is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sign not found")
    return sign
