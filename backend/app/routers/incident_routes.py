from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json

from ..database import get_db
from ..models import Incident, User, Department, Worker
from ..schemas import (
    IncidentResponse, IncidentDetailResponse, IncidentAssignRequest,
    IncidentCompleteRequest, IncidentFeedbackRequest, IncidentReopenRequest,
    IncidentTimelineResponse, ResolutionEvidenceResponse,
    ResolutionVerificationResponse, CitizenReportItem
)
from ..auth import get_current_user, require_role
from ..services.incident_service import (
    assign_worker_to_incident, accept_worker_task, start_worker_work,
    complete_worker_work, citizen_feedback_action
)
from ..services.sla_service import get_sla_status

router = APIRouter()

def format_incident_response(inc: Incident) -> dict:
    sla_info = get_sla_status(inc.sla_deadline) if inc.sla_deadline else {"remaining_seconds": 0, "is_breached": False}
    return {
        "id": inc.id,
        "category": inc.category,
        "description": inc.description,
        "latitude": inc.latitude,
        "longitude": inc.longitude,
        "landmark": inc.landmark,
        "ward": inc.ward,
        "severity": inc.severity,
        "severity_score": inc.severity_score,
        "priority_score": inc.priority_score,
        "status": inc.status,
        "department_id": inc.department_id,
        "department_name": inc.department.name if inc.department else None,
        "worker_id": inc.worker_id,
        "worker_name": inc.worker.name if inc.worker else None,
        "sla_hours": inc.sla_hours,
        "sla_deadline": inc.sla_deadline,
        "sla_remaining_seconds": sla_info["remaining_seconds"],
        "sla_breached": sla_info["is_breached"],
        "reporter_count": inc.reporter_count,
        "image_url": inc.image_url,
        "created_at": inc.created_at,
        "updated_at": inc.updated_at
    }

@router.get("", response_model=List[IncidentResponse])
def get_incidents(
    category: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    department_id: Optional[str] = None,
    sort_by: Optional[str] = "priority",
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if category:
        query = query.filter(Incident.category == category)
    if status:
        query = query.filter(Incident.status == status)
    if severity:
        query = query.filter(Incident.severity == severity)
    if department_id:
        query = query.filter(Incident.department_id == department_id)
        
    if sort_by == "priority":
        query = query.order_by(Incident.priority_score.desc(), Incident.created_at.desc())
    elif sort_by == "recent":
        query = query.order_by(Incident.created_at.desc())
    else:
        query = query.order_by(Incident.priority_score.desc())
        
    incidents = query.all()
    return [format_incident_response(i) for i in incidents]

@router.get("/{incident_id}", response_model=IncidentDetailResponse)
def get_incident_detail(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    base = format_incident_response(inc)
    
    analysis_data = None
    if inc.analysis:
        try:
            risk_summary = json.loads(inc.analysis.risk_summary) if inc.analysis.risk_summary else []
        except Exception:
            risk_summary = []
        try:
            priority_breakdown = json.loads(inc.analysis.priority_breakdown) if inc.analysis.priority_breakdown else []
        except Exception:
            priority_breakdown = []
            
        analysis_data = {
            "classification_confidence": inc.analysis.classification_confidence,
            "standardized_description": inc.analysis.standardized_description,
            "routing_confidence": inc.analysis.routing_confidence,
            "risk_summary": risk_summary,
            "priority_breakdown": priority_breakdown
        }
        
    timeline_items = [
        IncidentTimelineResponse(
            id=t.id,
            event=t.event,
            actor=t.actor,
            timestamp=t.timestamp,
            metadata_json=t.metadata_json
        )
        for t in inc.timeline
    ]
    
    evidence_data = None
    if inc.evidence:
        evidence_data = ResolutionEvidenceResponse(
            before_url=inc.evidence.before_url,
            after_url=inc.evidence.after_url,
            worker_note=inc.evidence.worker_note,
            submitted_at=inc.evidence.submitted_at
        )
        
    verification_data = None
    if inc.verification:
        verification_data = ResolutionVerificationResponse(
            confidence=inc.verification.confidence,
            status=inc.verification.status,
            reason=inc.verification.reason,
            issue_remaining=inc.verification.issue_remaining,
            created_at=inc.verification.created_at
        )
        
    citizen_reports_items = [
        CitizenReportItem(
            id=r.id,
            citizen_name=r.citizen.name if r.citizen and not r.anonymous else "Verified Citizen (Anonymous)",
            input_type=r.input_type,
            original_text=r.original_text,
            image_url=r.image_url,
            video_url=r.video_url,
            landmark=r.landmark,
            created_at=r.created_at,
            anonymous=r.anonymous
        )
        for r in inc.reports
    ]
    
    return IncidentDetailResponse(
        **base,
        analysis=analysis_data,
        timeline=timeline_items,
        evidence=evidence_data,
        verification=verification_data,
        citizen_reports=citizen_reports_items
    )

@router.post("/{incident_id}/assign")
def assign_worker(incident_id: str, req: IncidentAssignRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = assign_worker_to_incident(db, incident_id, req.worker_id, actor_name=current_user.name)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to assign"))
    return res

@router.post("/{incident_id}/accept")
def accept_task(incident_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = accept_worker_task(db, incident_id, current_user)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to accept"))
    return res

@router.post("/{incident_id}/start")
def start_work(incident_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = start_worker_work(db, incident_id, current_user)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to start work"))
    return res

@router.post("/{incident_id}/complete")
def complete_work(incident_id: str, req: IncidentCompleteRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = complete_worker_work(db, incident_id, after_url=req.after_url, worker_note=req.worker_note, worker_user=current_user)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to complete work"))
    return res

@router.post("/{incident_id}/feedback")
def submit_citizen_feedback(incident_id: str, req: IncidentFeedbackRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = citizen_feedback_action(db, incident_id, current_user, resolved=req.resolved, comment=req.comment or "")
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to record feedback"))
    return res

@router.post("/{incident_id}/reopen")
def reopen_incident(incident_id: str, req: IncidentReopenRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = citizen_feedback_action(db, incident_id, current_user, resolved=False, comment=req.reason)
    return res
