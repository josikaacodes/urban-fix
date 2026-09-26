import math
from datetime import datetime
from sqlalchemy.orm import Session
from ..models import Incident

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Returns distance in meters
    R = 6371000.0  # Earth radius in meters
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def check_for_duplicates(
    db: Session,
    category: str,
    latitude: float,
    longitude: float,
    threshold_meters: float = 150.0
) -> dict:
    # Query active/open incidents in the database
    active_statuses = ['SUBMITTED', 'AI_ANALYZING', 'AI_VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'REOPENED']
    recent_incidents = db.query(Incident).filter(Incident.status.in_(active_statuses)).all()
    
    best_match = None
    min_dist = float('inf')
    
    for inc in recent_incidents:
        # Category matching
        if inc.category == category or (category in ["Pothole", "Damaged Road"] and inc.category in ["Pothole", "Damaged Road"]):
            dist = haversine_distance(latitude, longitude, inc.latitude, inc.longitude)
            if dist <= threshold_meters and dist < min_dist:
                min_dist = dist
                best_match = inc
                
    if best_match:
        # Calculate match confidence
        dist_factor = max(0.0, 1.0 - (min_dist / threshold_meters))
        match_confidence = round(80.0 + (dist_factor * 18.0), 1)
        
        # Calculate time ago
        diff = datetime.utcnow() - best_match.created_at
        mins = int(diff.total_seconds() / 60)
        if mins < 60:
            time_str = f"{max(1, mins)} minutes ago"
        elif mins < 1440:
            time_str = f"{int(mins/60)} hours ago"
        else:
            time_str = f"{int(mins/1440)} days ago"
            
        return {
            "is_duplicate": True,
            "match_confidence": match_confidence,
            "master_incident_id": best_match.id,
            "category": best_match.category,
            "distance_meters": int(min_dist),
            "reported_time_ago": time_str,
            "existing_reporters_count": best_match.reporter_count,
            "landmark": best_match.landmark,
            "status": best_match.status
        }
        
    return {
        "is_duplicate": False,
        "match_confidence": 0.0,
        "master_incident_id": None
    }
