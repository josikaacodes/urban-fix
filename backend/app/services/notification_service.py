from sqlalchemy.orm import Session
from ..models import Notification, User
from datetime import datetime

def create_notification(
    db: Session,
    user_id: str,
    title: str,
    message: str,
    incident_id: str = None,
    notif_type: str = "info"
):
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        incident_id=incident_id,
        type=notif_type,
        read=False,
        created_at=datetime.utcnow()
    )
    db.add(notif)
    db.commit()
    return notif

def notify_authority_role(db: Session, title: str, message: str, incident_id: str = None, notif_type: str = "alert"):
    authorities = db.query(User).filter(User.role.in_(['authority', 'department_head'])).all()
    for auth in authorities:
        notif = Notification(
            user_id=auth.id,
            title=title,
            message=message,
            incident_id=incident_id,
            type=notif_type,
            read=False,
            created_at=datetime.utcnow()
        )
        db.add(notif)
    db.commit()
