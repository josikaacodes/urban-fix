"""
AIService — orchestrates Gemini AI triage + spatial deduplication.

Pipeline:
    1. Decode optional base64 image.
    2. Call GeminiClient.analyze_civic_issue() for structured classification.
    3. Run Haversine spatial clustering against active open incidents.
    4. Return a fully-populated IssueAnalysisResponse.
"""
from __future__ import annotations

import base64
import logging
import math
from typing import Any, Optional

from ..integrations.gemini import GeminiClient
from ..schemas.ai import (
    CivicDepartment,
    IssueAnalysisRequest,
    IssueAnalysisResponse,
    SeverityLevel,
)

logger = logging.getLogger(__name__)

# Spatial clustering radius in metres
CLUSTER_RADIUS_METERS: float = 150.0

# Earth radius used for Haversine formula
_EARTH_RADIUS_M: float = 6_371_000.0


# ---------------------------------------------------------------------------
# Haversine distance
# ---------------------------------------------------------------------------

def haversine_distance(
    lat1: float, lon1: float,
    lat2: float, lon2: float,
) -> float:
    """Return the great-circle distance in **metres** between two WGS-84 points."""
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    return _EARTH_RADIUS_M * 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))


# ---------------------------------------------------------------------------
# AIService
# ---------------------------------------------------------------------------

class AIService:
    """
    Orchestrator for the full UrbanFix triage pipeline.

    Designed to be instantiated per-request (or as a singleton via FastAPI
    dependency injection).  All I/O is async-ready; the Gemini SDK call is
    awaited via ``asyncio.to_thread`` if the underlying SDK is synchronous.
    """

    def __init__(self) -> None:
        self._gemini = GeminiClient()

    async def triage_issue(
        self,
        request: IssueAnalysisRequest,
        active_issues: list[dict[str, Any]],
    ) -> IssueAnalysisResponse:
        """
        Run the full triage pipeline for a single incoming citizen report.

        Args:
            request:       Validated ``IssueAnalysisRequest`` from the API layer.
            active_issues: List of currently open incident dicts, each with at
                           minimum the keys:
                           ``id``, ``latitude``, ``longitude``, ``category``,
                           ``department``, ``status``.
                           Pass an empty list when no database is available.

        Returns:
            ``IssueAnalysisResponse`` with all fields populated.
        """
        # ── Step 1: Decode image ──────────────────────────────────────────────
        image_bytes: Optional[bytes] = _decode_image(request.image_base64)

        # ── Step 2: AI classification ─────────────────────────────────────────
        ai_result = await self._gemini.analyze_civic_issue(
            title=request.title,
            description=request.description,
            image_bytes=image_bytes,
        )

        category: str = ai_result.get("category", "Other")
        department_raw: str = ai_result.get("department", "Public Works / Roads")
        severity_raw: str = ai_result.get("severity", "MEDIUM")
        confidence: float = float(ai_result.get("confidence_score", 0.85))
        hazard_summary: str = ai_result.get("hazard_risk_summary", "")
        recommended_action: str = ai_result.get("recommended_action", "")
        is_emergency: bool = bool(ai_result.get("is_emergency", False))

        # Normalise department / severity to enum values gracefully
        department = _parse_department(department_raw)
        severity = _parse_severity(severity_raw)

        # ── Step 3: Spatial deduplication ────────────────────────────────────
        parent_cluster_id: Optional[str] = _find_cluster(
            lat=request.latitude,
            lon=request.longitude,
            department=department,
            active_issues=active_issues,
            radius_m=CLUSTER_RADIUS_METERS,
        )

        # ── Step 4: Build and return response ────────────────────────────────
        return IssueAnalysisResponse(
            category=category,
            department=department,
            severity=severity,
            confidence_score=confidence,
            hazard_risk_summary=hazard_summary,
            recommended_action=recommended_action,
            is_emergency=is_emergency,
            parent_cluster_id=parent_cluster_id,
        )


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _decode_image(image_base64: Optional[str]) -> Optional[bytes]:
    """
    Safely decode a base64 string to raw bytes.

    Returns ``None`` if the input is absent or invalid; never raises.
    """
    if not image_base64:
        return None
    try:
        # Pad if necessary
        padding = len(image_base64) % 4
        if padding:
            image_base64 += "=" * (4 - padding)
        return base64.b64decode(image_base64)
    except Exception as exc:
        logger.warning("Image base64 decoding failed (will proceed without image): %s", exc)
        return None


def _find_cluster(
    lat: float,
    lon: float,
    department: CivicDepartment,
    active_issues: list[dict[str, Any]],
    radius_m: float,
) -> Optional[str]:
    """
    Scan active_issues for the nearest incident in the same department
    within ``radius_m`` metres.  Returns its ``id`` or ``None``.

    Only incidents whose ``status`` is not RESOLVED/CLOSED/CANCELLED are
    considered cluster candidates.
    """
    _OPEN_STATUSES = {
        "SUBMITTED", "AI_ANALYZING", "AI_VERIFIED",
        "ASSIGNED", "IN_PROGRESS", "PENDING_VERIFICATION", "REOPENED",
    }
    best_id: Optional[str] = None
    best_dist: float = float("inf")

    for issue in active_issues:
        issue_status = str(issue.get("status", "")).upper()
        if issue_status not in _OPEN_STATUSES:
            continue

        # Department proximity check — allow same-department OR emergency services
        issue_dept = _parse_department(str(issue.get("department", "")))
        if issue_dept != department and department != CivicDepartment.DISASTER_EMERGENCY:
            continue

        i_lat = issue.get("latitude")
        i_lon = issue.get("longitude")
        if i_lat is None or i_lon is None:
            continue

        dist = haversine_distance(lat, lon, float(i_lat), float(i_lon))
        if dist <= radius_m and dist < best_dist:
            best_dist = dist
            best_id = str(issue.get("id", ""))

    return best_id or None


def _parse_department(raw: str) -> CivicDepartment:
    """Map a raw department string to the ``CivicDepartment`` enum, with fallback."""
    _mapping = {
        "electricity board": CivicDepartment.ELECTRICITY,
        "electricity": CivicDepartment.ELECTRICITY,
        "public works / roads": CivicDepartment.PUBLIC_WORKS,
        "public works": CivicDepartment.PUBLIC_WORKS,
        "roads": CivicDepartment.PUBLIC_WORKS,
        "water supply and sewerage": CivicDepartment.WATER_SEWERAGE,
        "water supply & sewerage": CivicDepartment.WATER_SEWERAGE,
        "water": CivicDepartment.WATER_SEWERAGE,
        "waste management and sanitation": CivicDepartment.WASTE_MANAGEMENT,
        "waste management & sanitation": CivicDepartment.WASTE_MANAGEMENT,
        "waste": CivicDepartment.WASTE_MANAGEMENT,
        "disaster and emergency services": CivicDepartment.DISASTER_EMERGENCY,
        "disaster & emergency services": CivicDepartment.DISASTER_EMERGENCY,
        "disaster": CivicDepartment.DISASTER_EMERGENCY,
        "emergency": CivicDepartment.DISASTER_EMERGENCY,
    }
    return _mapping.get(raw.strip().lower(), CivicDepartment.PUBLIC_WORKS)


def _parse_severity(raw: str) -> SeverityLevel:
    """Map raw severity string to ``SeverityLevel`` enum, with MEDIUM fallback."""
    try:
        return SeverityLevel(raw.strip().upper())
    except ValueError:
        return SeverityLevel.MEDIUM
