from typing import Dict, Any, List

def calculate_priority_score(
    severity_score: int,
    category: str,
    is_school_zone: bool = False,
    is_traffic_arterial: bool = False,
    is_hospital_zone: bool = False,
    reporter_count: int = 1,
    hours_unresolved: int = 0
) -> Dict[str, Any]:
    # Formula weights:
    # Severity: 35%
    # Safety Risk: 25%
    # Critical Location: 15%
    # Unique Citizen Reports: 10%
    # Traffic Exposure: 10%
    # Time Unresolved: 5%

    damage_severity_points = int(severity_score * 0.35)
    
    # Safety Risk points (0-25)
    if category in ["Open Manhole", "Electrical Hazard"]:
        safety_risk_points = 24
    elif category in ["Pothole", "Flooding", "Fallen Tree"]:
        safety_risk_points = 21
    else:
        safety_risk_points = 14
        
    # Critical Location (0-15)
    if is_school_zone or is_hospital_zone:
        location_points = 15
    elif is_traffic_arterial:
        location_points = 12
    else:
        location_points = 6
        
    # Traffic Exposure (0-10)
    traffic_points = 10 if is_traffic_arterial else 6
    
    # Citizen Reports (0-10)
    report_points = min(10, 4 + (reporter_count * 2))
    
    # Time unresolved (0-5)
    time_points = min(5, int(hours_unresolved / 12))
    
    total_priority = damage_severity_points + safety_risk_points + location_points + traffic_points + report_points + time_points
    total_priority = max(10, min(99, total_priority))
    
    breakdown = [
        {"factor": "Damage Severity", "score": damage_severity_points, "description": f"{damage_severity_points} pts from severity analysis ({severity_score}/100)"},
        {"factor": "Vehicle & Pedestrian Safety Risk", "score": safety_risk_points, "description": f"{safety_risk_points} pts for hazard category ({category})"},
        {"factor": "Critical Zone Proximity", "score": location_points, "description": f"{location_points} pts for sensitive/pedestrian zone"},
        {"factor": "Traffic Exposure", "score": traffic_points, "description": f"{traffic_points} pts based on traffic volume density"},
        {"factor": "Citizen Reports Velocity", "score": report_points, "description": f"{report_points} pts from {reporter_count} active citizen verification(s)"}
    ]
    
    if time_points > 0:
        breakdown.append({"factor": "Time Unresolved Escalation", "score": time_points, "description": f"{time_points} pts for aging incident ({hours_unresolved} hrs)"})

    return {
        "priority_score": total_priority,
        "breakdown": breakdown
    }
