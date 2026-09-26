import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

def gen_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    mobile = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'citizen', 'authority', 'department_head', 'worker'
    mobile_verified = Column(Boolean, default=False)
    identity_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("CitizenProfile", back_populates="user", uselist=False)
    worker_record = relationship("Worker", back_populates="user", uselist=False)
    reports = relationship("CitizenReport", back_populates="citizen")
    notifications = relationship("Notification", back_populates="user")

class CitizenProfile(Base):
    __tablename__ = "citizen_profiles"

    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    city = Column(String, default="Chennai")
    ward = Column(String, default="Ward 142 - Porur")
    anonymous_reporting_enabled = Column(Boolean, default=False)

    user = relationship("User", back_populates="profile")

class Department(Base):
    __tablename__ = "departments"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False, unique=True)
    code = Column(String, nullable=True)
    description = Column(String, nullable=True)

    workers = relationship("Worker", back_populates="department")
    incidents = relationship("Incident", back_populates="department")

class Worker(Base):
    __tablename__ = "workers"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    department_id = Column(String, ForeignKey("departments.id"), nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    availability = Column(Boolean, default=True)
    active_task_count = Column(Integer, default=0)
    latitude = Column(Float, default=13.0382)
    longitude = Column(Float, default=80.1565)
    skills = Column(String, default="Road Repair, Pothole Patching")

    user = relationship("User", back_populates="worker_record")
    department = relationship("Department", back_populates="workers")
    incidents = relationship("Incident", back_populates="worker")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True)  # e.g., 'INC-2026-1042'
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    landmark = Column(String, nullable=True)
    ward = Column(String, default="Porur")
    severity = Column(String, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    severity_score = Column(Integer, default=50)  # 0-100
    priority_score = Column(Integer, default=50)  # 0-100
    status = Column(String, default="SUBMITTED")  # SUBMITTED, AI_ANALYZING, AI_VERIFIED, ASSIGNED, IN_PROGRESS, PENDING_VERIFICATION, RESOLVED, CITIZEN_CONFIRMED, CLOSED, REOPENED, VERIFICATION_FAILED
    department_id = Column(String, ForeignKey("departments.id"), nullable=True)
    worker_id = Column(String, ForeignKey("workers.id"), nullable=True)
    sla_hours = Column(Integer, default=24)
    sla_deadline = Column(DateTime, nullable=True)
    reporter_count = Column(Integer, default=1)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    department = relationship("Department", back_populates="incidents")
    worker = relationship("Worker", back_populates="incidents")
    analysis = relationship("IncidentAnalysis", back_populates="incident", uselist=False)
    timeline = relationship("IncidentTimeline", back_populates="incident", order_by="IncidentTimeline.timestamp.asc()")
    evidence = relationship("ResolutionEvidence", back_populates="incident", uselist=False)
    verification = relationship("ResolutionVerification", back_populates="incident", uselist=False)
    reports = relationship("CitizenReport", back_populates="master_incident")
    feedback = relationship("CitizenFeedback", back_populates="incident")

class IncidentAnalysis(Base):
    __tablename__ = "incident_analysis"

    incident_id = Column(String, ForeignKey("incidents.id"), primary_key=True)
    classification_confidence = Column(Float, default=95.0)
    standardized_description = Column(Text, nullable=True)
    risk_summary = Column(Text, nullable=True)  # JSON formatted string
    priority_breakdown = Column(Text, nullable=True)  # JSON formatted string
    routing_confidence = Column(Float, default=95.0)

    incident = relationship("Incident", back_populates="analysis")

class CitizenReport(Base):
    __tablename__ = "citizen_reports"

    id = Column(String, primary_key=True, default=lambda: f"REP-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4]}")
    citizen_id = Column(String, ForeignKey("users.id"), nullable=False)
    master_incident_id = Column(String, ForeignKey("incidents.id"), nullable=True)
    input_type = Column(String, default="photo")  # photo, video, text, voice
    original_text = Column(Text, nullable=True)
    standardized_text = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    landmark = Column(String, nullable=True)
    ward = Column(String, default="Porur")
    anonymous = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    citizen = relationship("User", back_populates="reports")
    master_incident = relationship("Incident", back_populates="reports")

class IncidentTimeline(Base):
    __tablename__ = "incident_timeline"

    id = Column(String, primary_key=True, default=gen_uuid)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    event = Column(String, nullable=False)
    actor = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    metadata_json = Column(Text, nullable=True)

    incident = relationship("Incident", back_populates="timeline")

class ResolutionEvidence(Base):
    __tablename__ = "resolution_evidence"

    incident_id = Column(String, ForeignKey("incidents.id"), primary_key=True)
    before_url = Column(String, nullable=True)
    after_url = Column(String, nullable=False)
    worker_note = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="evidence")

class ResolutionVerification(Base):
    __tablename__ = "resolution_verification"

    incident_id = Column(String, ForeignKey("incidents.id"), primary_key=True)
    confidence = Column(Integer, default=94)
    status = Column(String, default="VERIFIED")  # VERIFIED, NEEDS_HUMAN_REVIEW, VERIFICATION_FAILED
    reason = Column(Text, nullable=True)
    issue_remaining = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="verification")

class CitizenFeedback(Base):
    __tablename__ = "citizen_feedback"

    id = Column(String, primary_key=True, default=gen_uuid)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    citizen_id = Column(String, ForeignKey("users.id"), nullable=False)
    resolved = Column(Boolean, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="feedback")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    incident_id = Column(String, nullable=True)
    type = Column(String, default="info")
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(String, default="AADHAAR_PROTOTYPE")  # AADHAAR_PROTOTYPE, MOBILE_OTP
    status = Column(String, default="VERIFIED")
    masked_reference = Column(String, nullable=False)
    verified_at = Column(DateTime, default=datetime.utcnow)
