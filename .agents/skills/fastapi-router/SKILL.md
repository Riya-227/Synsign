---
name: fastapi-router
description: >
  Guides the creation and modification of FastAPI routers within the SynSign
  project. Enforces consistent endpoint conventions, error handling patterns,
  and Pydantic schema usage across all service modules.
---

# FastAPI Router Skill

## Purpose
Ensure all API routers in `app/services/*/router.py` follow the same
structural conventions for consistency, discoverability, and testability.

## Router Conventions

### 1. File Location
- Every service module lives in `app/services/<feature>/`.
- Each feature folder contains at minimum:
  - `__init__.py` — package docstring
  - `router.py`   — FastAPI `APIRouter` instance
  - `service.py`  — business logic (no FastAPI imports)

### 2. Router Declaration
```python
from fastapi import APIRouter
router = APIRouter()
```
- The variable **must** be named `router` (lowercase) so `main.py` imports work uniformly.

### 3. Prefix & Tags
- Routers are mounted in `app/main.py` with prefix `/api/v1/<feature>`.
- Tags match the feature name for OpenAPI grouping.

### 4. Endpoint Patterns
| Method | Path Pattern     | Purpose                     |
|--------|------------------|-----------------------------|
| GET    | `/`              | List resources (paginated)  |
| GET    | `/{id}`          | Get single resource         |
| GET    | `/search`        | Search / filter             |
| POST   | `/`              | Create resource             |
| PUT    | `/{id}`          | Full update                 |
| PATCH  | `/{id}`          | Partial update              |
| DELETE | `/{id}`          | Delete resource             |

### 5. Error Handling
- Use `HTTPException` with appropriate status codes.
- Always include a human-readable `detail` message.
- Never let unhandled exceptions leak to the client.

```python
from fastapi import HTTPException, status

raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Resource not found",
)
```

### 6. Schema Usage
- Import Pydantic models from `app/schemas/schemas.py`.
- Use `response_model=` on endpoints to enforce output shape.

### 7. Dependency Injection
- Use `Depends()` for authentication, database sessions, and service singletons.
- Keep router files thin — delegate all logic to `service.py`.

## Adding a New Feature

1. Create `app/services/<feature>/` with `__init__.py`, `router.py`, `service.py`.
2. Add Pydantic schemas to `app/schemas/schemas.py`.
3. Register the router in `app/main.py`:
   ```python
   from app.services.<feature>.router import router as feature_router
   app.include_router(feature_router, prefix="/api/v1/<feature>", tags=["Feature"])
   ```
4. Add smoke tests in `tests/test_api.py`.

## When to Use
- When creating a new service module.
- When modifying existing endpoints.
- During code review of router files.
