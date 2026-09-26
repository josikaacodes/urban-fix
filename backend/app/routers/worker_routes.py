from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Worker, Incident, User
from ..schemas import WorkerResponse, IncidentResponse
from ..auth import get_current_user
from .incident_routes import format_incident_response

router = APIRouter()

@router.get("", response_model=List[WorkerResponse])
def get_workers(department_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Worker)
    if department_id:
        query = query.filter(Worker.department_id == department_id)
    workers = query.all()
    
    # Calculate mock proximity distances for assignment UX
    dist_map = {"0": 0.8, "1": 1.4, "2": 2.1, "3": 3.5, "4": 1.2, "5": 4.0}
    res = []
    for idx, w in enumerate(workers):
        res.append(
            WorkerResponse(
                id=w.id,
                user_id=w.user_id,
                department_id=w.department_id,
                department_name=w.department.name if w.department else None,
                name=w.name,
                phone=w.phone,
                availability=w.availability,
                active_task_count=w.active_task_count,
                latitude=w.latitude,
                longitude=w.longitude,
                skills=w.skills,
                distance_km=dist_map.get(str(idx % 6), 1.5)
            )
        )
    return res

@router.get("/me/tasks", response_model=List[IncidentResponse])
def get_my_worker_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.user_id == current_user.id).first()
    if not worker:
        # Fallback if user is worker role but worker record is queried
        worker = db.query(Worker).first()
        if not worker:
            return []
            
    tasks = db.query(Incident).filter(Incident.worker_id == worker.id).order_by(Incident.priority_score.desc()).all()
    return [format_incident_response(t) for t in tasks]
