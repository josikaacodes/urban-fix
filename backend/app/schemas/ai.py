from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class SeverityLevel(str, Enum):
    """Standardized severity tiers for civic incidents."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class CivicDepartment(str, Enum):
    """Municipal departments that receive incident dispatches."""
    ELECTRICITY = "Electricity Board"
    PUBLIC_WORKS = "Public Works / Roads"
    WATER_SEWERAGE = "Water Supply and Sewerage"
    WASTE_MANAGEMENT = "Waste Management and Sanitation"
    DISASTER_EMERGENCY = "Disaster and Emergency Services"


class IssueAnalysisRequest(BaseModel):
    """Incoming triage request from a citizen report submission."""

    title: str = Field(
        ...,
        min_length=3,
        max_length=200,
        description="Short title of the civic issue.",
    )
    description: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="Detailed description of the civic issue.",
    )
    image_base64: Optional[str] = Field(
        None,
        description=(
            "Base64-encoded image (JPEG/PNG). Optional — "
            "analysis runs on text alone if absent."
        ),
    )
    latitude: float = Field(
        ..., ge=-90.0, le=90.0,
        description="WGS-84 decimal latitude of the reported location.",
    )
    longitude: float = Field(
        ..., ge=-180.0, le=180.0,
        description="WGS-84 decimal longitude of the reported location.",
    )

    @field_validator("image_base64", mode="before")
    @classmethod
    def strip_data_uri_prefix(cls, v: Optional[str]) -> Optional[str]:
        """Strip 'data:image/...;base64,' prefix if the client sends a data URI."""
        if v and isinstance(v, str) and v.startswith("data:"):
            try:
                v = v.split(",", 1)[1]
            except IndexError:
                pass
        return v or None

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "Transformer explosion near bus stand",
                "description": (
                    "A transformer near the Porur bus stand exploded with loud "
                    "noise and active sparking. Live wires are hanging on the road. "
                    "Immediate danger to public."
                ),
                "latitude": 13.0382,
                "longitude": 80.1565,
            }
        }
    }


class IssueAnalysisResponse(BaseModel):
    """Structured triage result returned to the caller after AI analysis."""

    category: str = Field(
        ..., description="Civic issue category (e.g., Electrical Hazard, Pothole)."
    )
    department: CivicDepartment = Field(
        ..., description="Municipal department responsible for resolution."
    )
    severity: SeverityLevel = Field(
        ..., description="Assessed severity level of the incident."
    )
    confidence_score: float = Field(
        ..., ge=0.0, le=1.0,
        description="AI classification confidence between 0.0 and 1.0.",
    )
    hazard_risk_summary: str = Field(
        ..., description="Human-readable summary of the risks posed by this incident."
    )
    recommended_action: str = Field(
        ..., description="AI-recommended immediate action for the dispatched team."
    )
    is_emergency: bool = Field(
        ...,
        description="True if the incident requires immediate life-safety escalation.",
    )
    parent_cluster_id: Optional[str] = Field(
        None,
        description=(
            "ID of the existing master incident if this report is a spatial duplicate."
        ),
    )
    # Hyper-local section office dispatch metadata.
    assigned_office: Optional[str] = Field(
        None, description="Local section office assigned to handle the incident."
    )
    division: Optional[str] = Field(
        None, description="Administrative division containing the incident location."
    )
    office_address: Optional[str] = Field(
        None, description="Postal address of the assigned section office."
    )
    emergency_helpline: Optional[str] = Field(
        None, description="Emergency helpline for the assigned service or office."
    )
    routing_match_reason: Optional[str] = Field(
        None, description="Reason the location was matched to the assigned office."
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "category": "Electrical Hazard",
                "department": "Electricity Board",
                "severity": "CRITICAL",
                "confidence_score": 0.97,
                "hazard_risk_summary": (
                    "Active transformer explosion with live high-voltage wires on a "
                    "public road. Electrocution risk is imminent for pedestrians and motorists."
                ),
                "recommended_action": (
                    "Dispatch emergency electrical crew immediately. Cordon off 50m radius. "
                    "Alert Disaster and Emergency Services."
                ),
                "is_emergency": True,
                "parent_cluster_id": None,
                "assigned_office": "AE / O&M / Porur Section Office",
                "division": "Porur Division",
                "office_address": "Porur Section Office, Chennai",
                "emergency_helpline": "1912",
                "routing_match_reason": "Matched GPS coordinates to the Porur section boundary.",
            }
        }
    }
