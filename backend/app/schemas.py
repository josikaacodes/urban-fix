from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class UserLogin(BaseModel):
    email_or_mobile: str
    password: str

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    mobile: str
    password: str
    city: Optional[str] = "Chennai"
    ward: Optional[str] = "Ward 142 - Porur"

class MobileSendOTPRequest(BaseModel):
    mobile: str

class MobileVerifyOTPRequest(BaseModel):
    mobile: str
    otp: str

class IdentitySendOTPRequest(BaseModel):
    id_number: str
    id_type: Optional[str] = "AADHAAR"

class IdentityVerifyOTPRequest(BaseModel):
    id_number: str
    otp: str
    consent_given: bool

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    mobile: Optional[str]
    role: str
    mobile_verified: bool
    identity_verified: bool
    created_at: datetime
    city: Optional[str] = "Chennai"
    ward: Optional[str] = "Porur"
    anonymous_reporting_enabled: Optional[bool] = False

    class Config:
        from_attributes = True

class PriorityFactor(BaseModel):
    factor: str
    score: int
    description: str

class AIAnalysisResult(BaseModel):
    category: str
    confidence: float
    severity: str
    severity_score: int
    priority_score: int
    recommended_department: str
    department_id: Optional[str] = None
    standardized_description: str
    routing_confidence: float
    risk_factors: List[Dict[str, Any]]
    priority_breakdown: List[PriorityFactor]

class CheckDuplicateRequest(BaseModel):
    category: str
    latitude: float
    longitude: float
    text: Optional[str] = ""

class DuplicateMatch(BaseModel):
    is_duplicate: bool
    match_confidence: float
    master_incident_id: Optional[str] = None
    category: Optional[str] = None
    distance_meters: Optional[int] = None
    reported_time_ago: Optional[str] = None
    existing_reporters_count: Optional[int] = 0
    landmark: Optional[str] = None
    status: Optional[str] = None

class ReportCreate(BaseModel):
    input_type: str = "photo"  # photo, video, text, voice
    original_text: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    latitude: float
    longitude: float
    landmark: Optional[str] = ""
    ward: Optional[str] = "Porur"
    anonymous: Optional[bool] = False
    join_incident_id: Optional[str] = None  # If citizen chooses to join existing duplicate incident

class IncidentTimelineResponse(BaseModel):
    id: str
    event: str
    actor: str
    timestamp: datetime
    metadata_json: Optional[str] = None

    class Config:
        from_attributes = True

class ResolutionEvidenceResponse(BaseModel):
    before_url: Optional[str]
    after_url: str
    worker_note: Optional[str]
    submitted_at: datetime

    class Config:
        from_attributes = True

class ResolutionVerificationResponse(BaseModel):
    confidence: int
    status: str
    reason: Optional[str]
    issue_remaining: bool
    created_at: datetime

    class Config:
        from_attributes = True

class CitizenReportItem(BaseModel):
    id: str
    citizen_name: Optional[str] = "Verified Citizen"
    input_type: str
    original_text: Optional[str]
    image_url: Optional[str]
    video_url: Optional[str]
    landmark: Optional[str]
    created_at: datetime
    anonymous: bool

    class Config:
        from_attributes = True

class IncidentResponse(BaseModel):
    id: str
    category: str
    description: str
    latitude: float
    longitude: float
    landmark: Optional[str]
    ward: Optional[str]
    severity: str
    severity_score: int
    priority_score: int
    status: str
    department_id: Optional[str]
    department_name: Optional[str] = None
    worker_id: Optional[str]
    worker_name: Optional[str] = None
    sla_hours: int
    sla_deadline: Optional[datetime]
    sla_remaining_seconds: Optional[int] = None
    sla_breached: Optional[bool] = False
    reporter_count: int
    image_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class IncidentDetailResponse(IncidentResponse):
    analysis: Optional[Dict[str, Any]] = None
    timeline: List[IncidentTimelineResponse] = []
    evidence: Optional[ResolutionEvidenceResponse] = None
    verification: Optional[ResolutionVerificationResponse] = None
    citizen_reports: List[CitizenReportItem] = []

class IncidentAssignRequest(BaseModel):
    worker_id: str

class IncidentProgressRequest(BaseModel):
    note: Optional[str] = "Work in progress"

class IncidentCompleteRequest(BaseModel):
    after_url: str
    worker_note: Optional[str] = "Pothole filled and surface levelled."

class IncidentFeedbackRequest(BaseModel):
    resolved: bool
    comment: Optional[str] = None

class IncidentReopenRequest(BaseModel):
    reason: str

class WorkerResponse(BaseModel):
    id: str
    user_id: str
    department_id: str
    department_name: Optional[str] = None
    name: str
    phone: Optional[str]
    availability: bool
    active_task_count: int
    latitude: float
    longitude: float
    skills: str
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True

class DepartmentResponse(BaseModel):
    id: str
    name: str
    code: Optional[str]
    description: Optional[str]
    incident_count: Optional[int] = 0
    active_worker_count: Optional[int] = 0

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    incident_id: Optional[str]
    type: str
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class OverviewMetrics(BaseModel):
    total_incidents: int
    critical_count: int
    high_priority_count: int
    pending_count: int
    in_progress_count: int
    resolved_count: int
    ai_verified_count: int
    duplicates_merged: int
    sla_compliance_rate: float
    avg_resolution_hours: float
