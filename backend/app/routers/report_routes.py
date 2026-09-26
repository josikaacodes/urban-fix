from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User, CitizenReport
from ..schemas import ReportCreate, AIAnalysisResult, CheckDuplicateRequest, DuplicateMatch, CitizenReportItem
from ..auth import get_current_user
from ..services.ai_understanding_service import analyze_report_content
from ..services.routing_service import route_incident
from ..services.priority_service import calculate_priority_score
from ..services.duplicate_detection_service import check_for_duplicates
from ..services.incident_service import create_or_join_incident

router = APIRouter()

@router.post("/analyze", response_model=AIAnalysisResult)
def analyze_report(text: str = "", landmark: str = "", input_type: str = "photo"):
    res = analyze_report_content(text=text, landmark=landmark, input_type=input_type)
    routing = route_incident(res["category"])
    priority = calculate_priority_score(
        severity_score=res["severity_score"],
        category=res["category"],
        is_school_zone=res["is_school_zone"],
        is_traffic_arterial=res["is_traffic_arterial"],
        is_hospital_zone=res["is_hospital_zone"],
        reporter_count=1
    )
    return AIAnalysisResult(
        category=res["category"],
        confidence=res["confidence"],
        severity=res["severity"],
        severity_score=res["severity_score"],
        priority_score=priority["priority_score"],
        recommended_department=routing["recommended_department"],
        standardized_description=res["standardized_description"],
        routing_confidence=routing["routing_confidence"],
        risk_factors=res["risk_factors"],
        priority_breakdown=priority["breakdown"]
    )

@router.post("/check-duplicate", response_model=DuplicateMatch)
def check_duplicate(req: CheckDuplicateRequest, db: Session = Depends(get_db)):
    res = check_for_duplicates(db, category=req.category, latitude=req.latitude, longitude=req.longitude)
    return DuplicateMatch(**res)

@router.post("")
def submit_report(req: ReportCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = create_or_join_incident(
        db=db,
        citizen=current_user,
        input_type=req.input_type,
        original_text=req.original_text or "",
        image_url=req.image_url,
        video_url=req.video_url,
        audio_url=req.audio_url,
        latitude=req.latitude,
        longitude=req.longitude,
        landmark=req.landmark or "",
        ward=req.ward or "Porur",
        anonymous=req.anonymous or False,
        join_incident_id=req.join_incident_id
    )
    return res

@router.get("/me", response_model=List[CitizenReportItem])
def get_my_reports(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reports = db.query(CitizenReport).filter(CitizenReport.citizen_id == current_user.id).order_by(CitizenReport.created_at.desc()).all()
    return [
        CitizenReportItem(
            id=r.id,
            citizen_name="You" if not r.anonymous else "Anonymous Citizen",
            input_type=r.input_type,
            original_text=r.original_text,
            image_url=r.image_url,
            video_url=r.video_url,
            landmark=r.landmark,
            created_at=r.created_at,
            anonymous=r.anonymous
        )
        for r in reports
    ]
