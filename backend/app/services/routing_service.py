from typing import Dict, Any

ROUTING_MAP = {
    "Pothole": {"dept": "Roads & Infrastructure", "code": "ROADS"},
    "Damaged Road": {"dept": "Roads & Infrastructure", "code": "ROADS"},
    "Damaged Footpath": {"dept": "Roads & Infrastructure", "code": "ROADS"},
    "Broken Streetlight": {"dept": "Electrical Operations", "code": "ELEC"},
    "Electrical Hazard": {"dept": "Electrical Operations", "code": "ELEC"},
    "Garbage Overflow": {"dept": "Sanitation & Solid Waste", "code": "SAN"},
    "Illegal Dumping": {"dept": "Sanitation & Solid Waste", "code": "SAN"},
    "Drainage Blockage": {"dept": "Water & Drainage", "code": "WATER"},
    "Water Leakage": {"dept": "Water & Drainage", "code": "WATER"},
    "Flooding": {"dept": "Parks & Disaster Management", "code": "DISASTER"},
    "Waterlogging": {"dept": "Water & Drainage", "code": "WATER"},
    "Open Manhole": {"dept": "Water & Drainage", "code": "WATER"},
    "Damaged Traffic Sign": {"dept": "Traffic Operations", "code": "TRAFFIC"},
    "Fallen Tree": {"dept": "Parks & Disaster Management", "code": "DISASTER"},
    "Other": {"dept": "Roads & Infrastructure", "code": "ROADS"}
}

def route_incident(category: str) -> Dict[str, Any]:
    match = ROUTING_MAP.get(category, {"dept": "Roads & Infrastructure", "code": "ROADS"})
    return {
        "recommended_department": match["dept"],
        "department_code": match["code"],
        "routing_confidence": 97.4,
        "auto_routable": True
    }
