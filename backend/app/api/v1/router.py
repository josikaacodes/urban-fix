"""
API v1 router — aggregates all versioned sub-routers.
"""
from fastapi import APIRouter

from .endpoints.ai import router as ai_router

api_v1_router = APIRouter()

api_v1_router.include_router(
    ai_router,
    prefix="/ai",
    tags=["AI Triage"],
)
