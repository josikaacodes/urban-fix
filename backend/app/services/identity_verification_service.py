from sqlalchemy.orm import Session
from ..models import User, VerificationRecord
from datetime import datetime
import re

PROTOTYPE_OTP = "123456"

def mask_aadhaar(number_str: str) -> str:
    cleaned = re.sub(r'\D', '', number_str)
    if len(cleaned) == 12:
        return f"XXXX XXXX {cleaned[-4:]}"
    return f"XXXX-XXXX-{cleaned[-4:] if len(cleaned)>=4 else '0000'}"

def send_identity_otp(id_number: str) -> dict:
    cleaned = re.sub(r'\D', '', id_number)
    if len(cleaned) != 12:
        return {"success": False, "error": "Please enter a valid 12-digit Aadhaar number format."}
    
    masked = mask_aadhaar(cleaned)
    return {
        "success": True,
        "masked_id": masked,
        "message": f"Verification OTP sent to Aadhaar-linked mobile for {masked}",
        "disclaimer": "Prototype identity verification for UrbanFix. No Aadhaar number is permanently stored."
    }

def verify_identity(db: Session, user: User, id_number: str, otp: str, consent_given: bool) -> dict:
    if not consent_given:
        return {"success": False, "error": "Consent is required to establish trusted citizen status."}
    
    if otp.strip() != PROTOTYPE_OTP:
        return {"success": False, "error": "Invalid OTP. Please enter 123456 for prototype verification."}
    
    cleaned = re.sub(r'\D', '', id_number)
    if len(cleaned) != 12:
        return {"success": False, "error": "Invalid Aadhaar number format."}
    
    masked = mask_aadhaar(cleaned)
    
    user.identity_verified = True
    
    rec = VerificationRecord(
        user_id=user.id,
        type="AADHAAR_PROTOTYPE",
        status="VERIFIED",
        masked_reference=masked,
        verified_at=datetime.utcnow()
    )
    db.add(rec)
    db.commit()
    db.refresh(user)
    
    return {
        "success": True,
        "identity_verified": True,
        "badge": "Verified Citizen",
        "masked_reference": masked,
        "verified_on": datetime.utcnow().strftime("%d %B %Y"),
        "message": "Identity verification completed successfully. You are now a Verified Citizen."
    }
