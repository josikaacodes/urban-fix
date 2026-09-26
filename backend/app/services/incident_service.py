import json
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from ..models import (
    Incident, IncidentAnalysis, CitizenReport, IncidentTimeline,
    ResolutionEvidence, ResolutionVerification, CitizenFeedback,
    Department, Worker, User
)
from .ai_understanding_service import analyze_report_content
from .routing_service import route_incident
from .priority_service import calculate_priority_score
from .sla_service import calculate_sla_deadline
from .notification_service import create_notification, notify_authority_role
from .verification_service import verify_resolution_evidence

def generate_incident_id(db: Session) -> str:
    year = datetime.utcnow().year
    count = db.query(Incident).count() + 1042
    return f"INC-{year}-{count}"

def create_or_join_incident(
    db: Session,
    citizen: User,
    input_type: str,
    original_text: str,
    image_url: str,
    video_url: str,
    audio_url: str,
    latitude: float,
    longitude: float,
    landmark: str,
    ward: str,
    anonymous: bool = False,
    join_incident_id: str = None
) -> dict:
    # 1. Run AI Understanding
    ai_res = analyze_report_content(
        text=original_text or "",
        input_type=input_type,
        landmark=landmark or "",
        has_image=bool(image_url)
    )
    
    # 2. If citizen chose to join existing duplicate incident
    if join_incident_id:
        master = db.query(Incident).filter(Incident.id == join_incident_id).first()
        if master:
            master.reporter_count += 1
            # Re-calculate priority score with increased reporters
            p_res = calculate_priority_score(
                severity_score=master.severity_score,
                category=master.category,
                is_school_zone=ai_res["is_school_zone"],
                is_traffic_arterial=ai_res["is_traffic_arterial"],
                is_hospital_zone=ai_res["is_hospital_zone"],
                reporter_count=master.reporter_count
            )
            master.priority_score = p_res["priority_score"]
            
            # Save citizen report
            report = CitizenReport(
                citizen_id=citizen.id,
                master_incident_id=master.id,
                input_type=input_type,
                original_text=original_text,
                standardized_text=ai_res["standardized_description"],
                image_url=image_url or master.image_url,
                video_url=video_url,
                audio_url=audio_url,
                latitude=latitude,
                longitude=longitude,
                landmark=landmark or master.landmark,
                ward=ward or master.ward,
                anonymous=anonymous,
                created_at=datetime.utcnow()
            )
            db.add(report)
            
            # Add timeline
            tl = IncidentTimeline(
                incident_id=master.id,
                event=f"Additional Citizen Report Merged (+1 reporter, total: {master.reporter_count})",
                actor="Citizen / System AI",
                metadata_json=json.dumps({"reporter_count": master.reporter_count, "new_priority": master.priority_score})
            )
            db.add(tl)
            db.commit()
            
            create_notification(
                db=db,
                user_id=citizen.id,
                title="Report Linked to Active Incident",
                message=f"Your report has been successfully linked to existing incident {master.id} ({master.category}). You will receive real-time resolution updates.",
                incident_id=master.id,
                notif_type="success"
            )
            
            return {
                "incident_id": master.id,
                "status": master.status,
                "category": master.category,
                "priority_score": master.priority_score,
                "department": master.department.name if master.department else "Roads & Infrastructure",
                "is_joined": True
            }

    # 3. Create Master Incident
    inc_id = generate_incident_id(db)
    routing = route_incident(ai_res["category"])
    dept = db.query(Department).filter(Department.name == routing["recommended_department"]).first()
    
    # Priority
    p_res = calculate_priority_score(
        severity_score=ai_res["severity_score"],
        category=ai_res["category"],
        is_school_zone=ai_res["is_school_zone"],
        is_traffic_arterial=ai_res["is_traffic_arterial"],
        is_hospital_zone=ai_res["is_hospital_zone"],
        reporter_count=1
    )
    
    # SLA
    sla = calculate_sla_deadline(ai_res["severity"])
    
    incident = Incident(
        id=inc_id,
        category=ai_res["category"],
        description=ai_res["standardized_description"],
        latitude=latitude,
        longitude=longitude,
        landmark=landmark or f"{ward}, Chennai",
        ward=ward or "Porur",
        severity=ai_res["severity"],
        severity_score=ai_res["severity_score"],
        priority_score=p_res["priority_score"],
        status="AI_VERIFIED",
        department_id=dept.id if dept else None,
        sla_hours=sla["sla_hours"],
        sla_deadline=sla["sla_deadline"],
        reporter_count=1,
        image_url=image_url,
        created_at=datetime.utcnow()
    )
    db.add(incident)
    db.commit()
    
    # Create Analysis record
    analysis = IncidentAnalysis(
        incident_id=incident.id,
        classification_confidence=ai_res["confidence"],
        standardized_description=ai_res["standardized_description"],
        risk_summary=json.dumps(ai_res["risk_factors"]),
        priority_breakdown=json.dumps(p_res["breakdown"]),
        routing_confidence=routing["routing_confidence"]
    )
    db.add(analysis)
    
    # Create Citizen Report
    report = CitizenReport(
        citizen_id=citizen.id,
        master_incident_id=incident.id,
        input_type=input_type,
        original_text=original_text,
        standardized_text=ai_res["standardized_description"],
        image_url=image_url,
        video_url=video_url,
        audio_url=audio_url,
        latitude=latitude,
        longitude=longitude,
        landmark=landmark,
        ward=ward,
        anonymous=anonymous,
        created_at=datetime.utcnow()
    )
    db.add(report)
    
    # Add Timelines
    tl1 = IncidentTimeline(
        incident_id=incident.id,
        event="Report Submitted by Citizen",
        actor="Citizen",
        timestamp=datetime.utcnow()
    )
    tl2 = IncidentTimeline(
        incident_id=incident.id,
        event=f"AI Analysis Completed — Categorized as '{incident.category}', Priority Score: {incident.priority_score}/100",
        actor="UrbanFix AI Engine",
        timestamp=datetime.utcnow()
    )
    tl3 = IncidentTimeline(
        incident_id=incident.id,
        event=f"Smart Routing Complete — Auto-routed to {routing['recommended_department']}",
        actor="UrbanFix Dispatch Core",
        timestamp=datetime.utcnow()
    )
    db.add_all([tl1, tl2, tl3])
    db.commit()
    
    # Notifications
    create_notification(
        db=db,
        user_id=citizen.id,
        title="Incident Created & AI Verified",
        message=f"Your report has been verified as {incident.category} (Priority: {incident.priority_score}/100) and assigned incident ID {incident.id}.",
        incident_id=incident.id,
        notif_type="success"
    )
    
    notify_authority_role(
        db=db,
        title=f"New {incident.severity} Priority Incident: {incident.category}",
        message=f"{incident.id} reported in {incident.landmark}. Routed to {routing['recommended_department']}. Priority: {incident.priority_score}/100.",
        incident_id=incident.id,
        notif_type="alert" if incident.severity in ['HIGH', 'CRITICAL'] else "info"
    )
    
    return {
        "incident_id": incident.id,
        "status": incident.status,
        "category": incident.category,
        "priority_score": incident.priority_score,
        "department": routing["recommended_department"],
        "is_joined": False
    }

def assign_worker_to_incident(db: Session, incident_id: str, worker_id: str, actor_name: str = "Municipal Authority") -> dict:
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    
    if not incident or not worker:
        return {"success": False, "error": "Incident or worker not found."}
        
    incident.worker_id = worker.id
    incident.status = "ASSIGNED"
    worker.active_task_count += 1
    
    tl = IncidentTimeline(
        incident_id=incident.id,
        event=f"Worker Assigned: {worker.name} ({worker.department.name if worker.department else 'Field Ops'})",
        actor=actor_name,
        timestamp=datetime.utcnow()
    )
    db.add(tl)
    db.commit()
    
    # Notify worker
    create_notification(
        db=db,
        user_id=worker.user_id,
        title="New Field Assignment Dispatched",
        message=f"You have been assigned to {incident.id} ({incident.category}) at {incident.landmark}. SLA: {incident.sla_hours} hours.",
        incident_id=incident.id,
        notif_type="alert"
    )
    
    # Notify reporter
    for r in incident.reports:
        create_notification(
            db=db,
            user_id=r.citizen_id,
            title="Field Worker Assigned",
            message=f"Worker {worker.name} from {incident.department.name if incident.department else 'Municipal Dept'} has been dispatched for your incident {incident.id}.",
            incident_id=incident.id,
            notif_type="info"
        )
        
    return {"success": True, "message": f"Incident {incident.id} assigned to {worker.name}"}

def accept_worker_task(db: Session, incident_id: str, worker_user: User) -> dict:
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        return {"success": False, "error": "Incident not found."}
        
    tl = IncidentTimeline(
        incident_id=incident.id,
        event=f"Task Accepted by Worker ({worker_user.name})",
        actor="Field Worker",
        timestamp=datetime.utcnow()
    )
    db.add(tl)
    db.commit()
    return {"success": True, "message": "Task accepted"}

def start_worker_work(db: Session, incident_id: str, worker_user: User) -> dict:
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        return {"success": False, "error": "Incident not found."}
        
    incident.status = "IN_PROGRESS"
    tl = IncidentTimeline(
        incident_id=incident.id,
        event="On-Site Remediation Work Commenced",
        actor="Field Worker",
        timestamp=datetime.utcnow()
    )
    db.add(tl)
    db.commit()
    
    for r in incident.reports:
        create_notification(
            db=db,
            user_id=r.citizen_id,
            title="Work Commenced on Site",
            message=f"Municipal maintenance team has started physical repair work on incident {incident.id}.",
            incident_id=incident.id,
            notif_type="info"
        )
        
    return {"success": True, "status": "IN_PROGRESS"}

def complete_worker_work(db: Session, incident_id: str, after_url: str, worker_note: str, worker_user: User) -> dict:
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        return {"success": False, "error": "Incident not found."}
        
    # 1. Save Resolution Evidence
    evidence = db.query(ResolutionEvidence).filter(ResolutionEvidence.incident_id == incident.id).first()
    if not evidence:
        evidence = ResolutionEvidence(
            incident_id=incident.id,
            before_url=incident.image_url,
            after_url=after_url,
            worker_note=worker_note or "Pothole filled and surface levelled.",
            submitted_at=datetime.utcnow()
        )
        db.add(evidence)
    else:
        evidence.after_url = after_url
        evidence.worker_note = worker_note
        evidence.submitted_at = datetime.utcnow()
        
    incident.status = "PENDING_VERIFICATION"
    
    tl = IncidentTimeline(
        incident_id=incident.id,
        event="Remediation Evidence Uploaded by Field Team — Submitted for AI Visual Verification",
        actor="Field Worker",
        timestamp=datetime.utcnow()
    )
    db.add(tl)
    db.commit()
    
    # 2. Run AI Resolution Verification
    v_res = verify_resolution_evidence(
        before_url=incident.image_url,
        after_url=after_url,
        worker_note=worker_note
    )
    
    verification = db.query(ResolutionVerification).filter(ResolutionVerification.incident_id == incident.id).first()
    if not verification:
        verification = ResolutionVerification(
            incident_id=incident.id,
            confidence=v_res["confidence"],
            status=v_res["status"],
            reason=v_res["reason"],
            issue_remaining=v_res["issue_remaining"],
            created_at=datetime.utcnow()
        )
        db.add(verification)
    else:
        verification.confidence = v_res["confidence"]
        verification.status = v_res["status"]
        verification.reason = v_res["reason"]
        verification.issue_remaining = v_res["issue_remaining"]
        
    if v_res["status"] == "VERIFIED":
        incident.status = "RESOLVED"
        tl_v = IncidentTimeline(
            incident_id=incident.id,
            event=f"AI Visual Verification PASSED (Confidence: {v_res['confidence']}%) — Resolution Verified",
            actor="UrbanFix AI Verification Core",
            timestamp=datetime.utcnow()
        )
        db.add(tl_v)
        
        # Notify citizens for confirmation
        for r in incident.reports:
            create_notification(
                db=db,
                user_id=r.citizen_id,
                title="Issue Resolved — Verification Requested",
                message=f"Incident {incident.id} has been resolved and verified by AI. Please confirm if the issue is completely fixed.",
                incident_id=incident.id,
                notif_type="action_required"
            )
    else:
        incident.status = "REOPENED"
        tl_v = IncidentTimeline(
            incident_id=incident.id,
            event=f"AI Visual Verification Inconclusive/Failed ({v_res['status']}) — Automatically Reopened",
            actor="UrbanFix AI Verification Core",
            timestamp=datetime.utcnow()
        )
        db.add(tl_v)
        
    db.commit()
    
    return {
        "success": True,
        "status": incident.status,
        "verification": v_res
    }

def citizen_feedback_action(db: Session, incident_id: str, citizen: User, resolved: bool, comment: str = "") -> dict:
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        return {"success": False, "error": "Incident not found."}
        
    fb = CitizenFeedback(
        incident_id=incident.id,
        citizen_id=citizen.id,
        resolved=resolved,
        comment=comment,
        created_at=datetime.utcnow()
    )
    db.add(fb)
    
    if resolved:
        incident.status = "CLOSED"
        tl = IncidentTimeline(
            incident_id=incident.id,
            event=f"Citizen Confirmation Received: 'Issue Fixed' ({citizen.name}) — Loop Successfully Closed",
            actor="Citizen",
            timestamp=datetime.utcnow()
        )
        db.add(tl)
        db.commit()
        
        create_notification(
            db=db,
            user_id=citizen.id,
            title="Incident Successfully Closed",
            message=f"Thank you for confirming resolution for {incident.id}. UrbanFix has closed the resolution loop!",
            incident_id=incident.id,
            notif_type="success"
        )
        
        notify_authority_role(
            db=db,
            title=f"Incident {incident.id} Closed by Citizen",
            message=f"Citizen {citizen.name} verified resolution of {incident.category} in {incident.landmark}.",
            incident_id=incident.id,
            notif_type="info"
        )
    else:
        incident.status = "REOPENED"
        tl = IncidentTimeline(
            incident_id=incident.id,
            event=f"Citizen Rejected Resolution: '{comment or 'Still a problem'}' — Incident REOPENED",
            actor="Citizen",
            timestamp=datetime.utcnow()
        )
        db.add(tl)
        db.commit()
        
        notify_authority_role(
            db=db,
            title=f"ESCALATION: Incident {incident.id} Reopened by Citizen",
            message=f"Citizen stated issue is still not fixed: '{comment or 'Defect remains on site'}'. Immediate supervisor review required.",
            incident_id=incident.id,
            notif_type="alert"
        )
        
    return {"success": True, "status": incident.status}
