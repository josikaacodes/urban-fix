from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Department, Incident
from ..schemas import DepartmentResponse, IncidentResponse
from .incident_routes import format_incident_response

router = APIRouter()

@router.get("", response_model=List[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    depts = db.query(Department).all()
    return [
        DepartmentResponse(
            id=d.id,
            name=d.name,
            code=d.code,
            description=d.description,
            incident_count=len(d.incidents),
            active_worker_count=len(d.workers)
        )
        for d in depts
    ]

@router.get("/{department_id}/incidents", response_model=List[IncidentResponse])
def get_department_incidents(department_id: str, db: Session = Depends(get_db)):
    incidents = db.query(Incident).filter(Incident.department_id == department_id).order_by(Incident.priority_score.desc()).all()
    return [format_incident_response(i) for i in incidents]
