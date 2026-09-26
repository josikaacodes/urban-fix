"""
AI Triage endpoints — /api/v1/ai

All business logic is delegated to AIService. Route handlers are intentionally
thin: validate input, call service, return response.
"""
from __future__ import annotations

import logging
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from ....schemas.ai import IssueAnalysisRequest, IssueAnalysisResponse
from ....services.ai_service import AIService

logger = logging.getLogger(__name__)

router = APIRouter()


# ---------------------------------------------------------------------------
# Dependency: AIService factory
# ---------------------------------------------------------------------------

def get_ai_service() -> AIService:
    """FastAPI dependency that provides a ready-to-use AIService instance."""
    return AIService()


AIServiceDep = Annotated[AIService, Depends(get_ai_service)]


# ---------------------------------------------------------------------------
# POST /api/v1/ai/analyze
# ---------------------------------------------------------------------------

@router.post(
    "/analyze",
    response_model=IssueAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Triage a civic issue report",
    description=(
        "Accepts a citizen incident report (with optional image), runs Gemini "
        "AI analysis, performs spatial deduplication against open incidents, and "
        "returns a structured triage decision including severity, department routing, "
        "emergency flag, and cluster assignment."
    ),
    responses={
        200: {"description": "Triage completed successfully."},
        422: {"description": "Request validation failed."},
        500: {"description": "AI analysis or internal error."},
        503: {"description": "Gemini AI service unavailable."},
    },
)
async def analyze_issue(
    request: IssueAnalysisRequest,
    ai_service: AIServiceDep,
) -> IssueAnalysisResponse:
    """
    Main triage endpoint.

    **Flow:**
    1. Validate the incoming ``IssueAnalysisRequest`` (Pydantic handles this).
    2. Load currently active incidents for spatial deduplication.
    3. Delegate to ``AIService.triage_issue()``.
    4. Return the ``IssueAnalysisResponse``.

    In a production system, step 2 fetches from the database via an injected
    repository.  Here we pass an empty list; integrate your DB session and
    incident repository to populate ``active_issues``.
    """
    # TODO: Inject DB session and replace with:
    #   active_issues = await incident_repo.get_open_incidents_near(
    #       lat=request.latitude, lon=request.longitude, radius_km=0.5
    #   )
    active_issues: list[dict[str, Any]] = []

    try:
        result = await ai_service.triage_issue(
            request=request,
            active_issues=active_issues,
        )
    except ValueError as exc:
        # Malformed AI response — surface as 500 with a clear message
        logger.error("AI triage value error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI triage failed (invalid response): {exc}",
        ) from exc
    except RuntimeError as exc:
        # Gemini SDK / network failure
        logger.error("Gemini service unavailable: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service temporarily unavailable: {exc}",
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected triage error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during triage.",
        ) from exc

    return result


# ---------------------------------------------------------------------------
# GET /api/v1/ai/health
# ---------------------------------------------------------------------------

@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="AI subsystem health check",
    tags=["AI Triage"],
)
async def ai_health() -> dict[str, str]:
    """Simple liveness check confirming the AI triage router is reachable."""
    return {"status": "ok", "subsystem": "AI Triage"}
