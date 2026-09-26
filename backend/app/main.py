import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import UPLOAD_DIR
from .seed import seed_database
from .routers import (
    auth_routes, report_routes, incident_routes,
    worker_routes, department_routes, analytics_routes,
    notification_routes, upload_routes
)
from .api.v1.router import api_v1_router

app = FastAPI(
    title="UrbanFix API",
    description="From citizen voice to verified action — Municipal Command & Civic Operations Engine",
    version="2.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────
_FRONTEND_ORIGINS = [
    "http://localhost:3000",       # Next.js / React dev
    "http://localhost:5173",       # Vite dev
    "http://localhost:8080",       # Alternative frontend port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_FRONTEND_ORIGINS,
    allow_origin_regex=r"https://.*\.urbanfix\.in",   # production wildcard
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static media ──────────────────────────────────────────────────────────
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ── Legacy routers (existing codebase) ────────────────────────────────────
app.include_router(auth_routes.router, prefix="/auth", tags=["Authentication"])
app.include_router(report_routes.router, prefix="/reports", tags=["Citizen Reports"])
app.include_router(incident_routes.router, prefix="/incidents", tags=["Incidents & Lifecycle"])
app.include_router(worker_routes.router, prefix="/workers", tags=["Workers & Field Tasks"])
app.include_router(department_routes.router, prefix="/departments", tags=["Departments"])
app.include_router(analytics_routes.router, prefix="/analytics", tags=["Analytics & Insights"])
app.include_router(notification_routes.router, prefix="/notifications", tags=["Notifications"])
app.include_router(upload_routes.router, prefix="/upload", tags=["Media Uploads"])

# ── AI Triage v1 router ───────────────────────────────────────────────────
app.include_router(api_v1_router, prefix="/api/v1")


@app.on_event("startup")
def on_startup() -> None:
    print("Initializing UrbanFix database & seed data...")
    seed_database()


@app.get("/", tags=["Health"])
def root() -> dict:
    return {
        "project": "URBANFIX",
        "tagline": "From citizen voice to verified action.",
        "status": "healthy",
        "docs": "/docs",
        "ai_triage": "/api/v1/ai/analyze",
    }
