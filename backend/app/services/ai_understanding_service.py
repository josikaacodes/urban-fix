import re
from typing import Dict, Any, List

CATEGORIES = [
    "Pothole",
    "Damaged Road",
    "Broken Streetlight",
    "Electrical Hazard",
    "Garbage Overflow",
    "Illegal Dumping",
    "Drainage Blockage",
    "Flooding",
    "Waterlogging",
    "Open Manhole",
    "Damaged Traffic Sign",
    "Fallen Tree",
    "Damaged Footpath",
    "Water Leakage",
    "Other"
]

KEYWORDS = {
    "Open Manhole": ["manhole", "drain cover", "open drain", "sewer hole", "chamber", "man hole", "moodi", "kuzhi"],
    "Flooding": ["flood", "water logging", "submerged", "waterlogged", "vellam", "thanneer thengi"],
    "Waterlogging": ["water logging", "water pool", "stagnant water", "water stagnation"],
    "Electrical Hazard": ["electric wire", "sparking", "live wire", "transformer", "shock", "current kambi", "wire thonguthu"],
    "Broken Streetlight": ["streetlight", "street light", "light not working", "dark street", "bulb fused", "vilakku"],
    "Pothole": ["pothole", "hole in road", "pit on road", "road damage", "periya kuzhi", "kuzhi irukku", "palanguli"],
    "Damaged Road": ["broken road", "cracked road", "asphalt broken", "uneven road", "tar road"],
    "Garbage Overflow": ["garbage", "trash", "dustbin full", "waste overflow", "kuppai", "smell"],
    "Illegal Dumping": ["illegal dumping", "debris dumped", "construction waste", "debris on road"],
    "Drainage Blockage": ["drainage blocked", "sewage overflow", "drain blocked", "saakadai", "choked drain"],
    "Water Leakage": ["water pipe burst", "pipe leak", "drinking water wasted", "kudineer leak"],
    "Fallen Tree": ["tree fallen", "branch broken", "tree blocking road", "maram vilundhadhu"],
    "Damaged Traffic Sign": ["traffic signal not working", "broken traffic sign", "signal down", "signboard broken"],
    "Damaged Footpath": ["footpath broken", "pavement broken", "pedestrian walk damaged", "walkway"]
}

def analyze_report_content(text: str = "", input_type: str = "photo", landmark: str = "", has_image: bool = True) -> Dict[str, Any]:
    text_lower = (text or "").lower()
    landmark_lower = (landmark or "").lower()
    combined = f"{text_lower} {landmark_lower}"
    
    detected_category = "Pothole"  # default
    max_matches = 0
    confidence = 94.0
    
    for category, terms in KEYWORDS.items():
        matches = sum(1 for term in terms if term in combined)
        if matches > max_matches:
            max_matches = matches
            detected_category = category
            confidence = min(98.5, 88.0 + (matches * 3.5))
            
    if max_matches == 0:
        if "light" in combined:
            detected_category = "Broken Streetlight"
        elif "water" in combined:
            detected_category = "Water Leakage"
        elif "wire" in combined:
            detected_category = "Electrical Hazard"
        elif "waste" in combined or "kuppa" in combined:
            detected_category = "Garbage Overflow"
        else:
            detected_category = "Pothole"
            confidence = 91.0
            
    # Determine base severity
    if detected_category in ["Open Manhole", "Electrical Hazard", "Flooding"]:
        severity = "CRITICAL"
        severity_score = 88
    elif detected_category in ["Pothole", "Drainage Blockage", "Fallen Tree"]:
        severity = "HIGH"
        severity_score = 72
    elif detected_category in ["Broken Streetlight", "Garbage Overflow", "Waterlogging"]:
        severity = "MEDIUM"
        severity_score = 48
    else:
        severity = "LOW"
        severity_score = 24
        
    # High risk proximity checks
    is_school = any(w in combined for w in ["school", "college", "students", "vidyalaya", "academy"])
    is_hospital = any(w in combined for w in ["hospital", "clinic", "emergency", "doctor"])
    is_metro = any(w in combined for w in ["metro", "bus stand", "junction", "main road", "highway"])
    
    if is_school or is_hospital:
        if severity == "MEDIUM":
            severity = "HIGH"
            severity_score += 15
        elif severity == "HIGH":
            severity_score = min(95, severity_score + 12)
            
    # Generate standardized description
    if detected_category == "Pothole":
        std_desc = f"Severe road-surface pothole creating significant hazard for two-wheelers and pedestrians near {landmark or 'roadway'}."
    elif detected_category == "Open Manhole":
        std_desc = f"Uncovered high-risk open manhole chamber posing immediate fatal danger to pedestrians and traffic near {landmark or 'roadway'}."
    elif detected_category == "Electrical Hazard":
        std_desc = f"Exposed hazardous electrical wiring/sparking posing severe electrocution risk near {landmark or 'public area'}."
    elif detected_category == "Garbage Overflow":
        std_desc = f"Solid municipal waste overflow creating severe sanitary and public health obstruction near {landmark or 'residential zone'}."
    elif detected_category == "Flooding":
        std_desc = f"Severe storm water inundation blocking traffic flow and risking pedestrian safety near {landmark or 'low-lying area'}."
    else:
        std_desc = f"Reported {detected_category} infrastructure defect requiring municipal maintenance near {landmark or 'reported location'}."
        
    # Risk factors list
    risk_factors = []
    if is_school:
        risk_factors.append({"factor": "High Pedestrian Zone", "impact": "High proximity to school/children"})
    if is_hospital:
        risk_factors.append({"factor": "Emergency Route", "impact": "Ambulance and medical transit pathway"})
    if is_metro:
        risk_factors.append({"factor": "Heavy Traffic Arterial", "impact": "Major transit corridor"})
    risk_factors.append({"factor": "Vulnerable Commuters", "impact": "Two-wheeler skid & pedestrian injury hazard"})
    
    return {
        "category": detected_category,
        "confidence": confidence,
        "severity": severity,
        "severity_score": severity_score,
        "standardized_description": std_desc,
        "risk_factors": risk_factors,
        "is_school_zone": is_school,
        "is_hospital_zone": is_hospital,
        "is_traffic_arterial": is_metro
    }
