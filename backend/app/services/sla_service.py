from datetime import datetime, timedelta
from typing import Dict, Any

SLA_HOURS_MAP = {
    "CRITICAL": 4,     # 4 hours
    "HIGH": 24,        # 24 hours
    "MEDIUM": 72,      # 3 days
    "LOW": 168        # 7 days
}

def calculate_sla_deadline(severity: str, start_time: datetime = None) -> Dict[str, Any]:
    if start_time is None:
        start_time = datetime.utcnow()
    hours = SLA_HOURS_MAP.get(severity.upper(), 24)
    deadline = start_time + timedelta(hours=hours)
    return {
        "sla_hours": hours,
        "sla_deadline": deadline
    }

def get_sla_status(deadline: datetime) -> Dict[str, Any]:
    if not deadline:
        return {"remaining_seconds": 0, "is_breached": False, "formatted": "--:--:--"}
    
    now = datetime.utcnow()
    diff = (deadline - now).total_seconds()
    
    if diff <= 0:
        overdue_secs = abs(diff)
        hrs = int(overdue_secs // 3600)
        mins = int((overdue_secs % 3600) // 60)
        secs = int(overdue_secs % 60)
        return {
            "remaining_seconds": 0,
            "is_breached": True,
            "formatted": f"BREACHED ({hrs:02d}:{mins:02d}:{secs:02d} overdue)"
        }
    else:
        hrs = int(diff // 3600)
        mins = int((diff % 3600) // 60)
        secs = int(diff % 60)
        return {
            "remaining_seconds": int(diff),
            "is_breached": False,
            "formatted": f"{hrs:02d}:{mins:02d}:{secs:02d}"
        }
