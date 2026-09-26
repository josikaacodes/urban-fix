from sqlalchemy.orm import Session
from ..models import User, VerificationRecord
from datetime import datetime

PROTOTYPE_OTP = "123456"

def send_mobile_otp(mobile: str) -> dict:
    # Clean mobile number
    clean_num = mobile.strip()
    return {
        "success": True,
        "mobile": clean_num,
        "message": f"OTP sent successfully to +91 {clean_num[-10:] if len(clean_num) >= 10 else clean_num}",
        "expires_in_seconds": 300
    }

def verify_mobile_otp(db: Session, user: User, mobile: str, otp: str) -> dict:
    if otp.strip() != PROTOTYPE_OTP:
        return {"success": False, "error": "Invalid OTP entered. Please use prototype OTP 123456."}
    
    user.mobile = mobile.strip()
    user.mobile_verified = True
    
    # Record verification
    rec = VerificationRecord(
        user_id=user.id,
        type="MOBILE_OTP",
        status="VERIFIED",
        masked_reference=f"+91-XXXXX-{mobile[-4:] if len(mobile)>=4 else '0000'}",
        verified_at=datetime.utcnow()
    )
    db.add(rec)
    db.commit()
    db.refresh(user)
    
    return {
        "success": True,
        "mobile_verified": True,
        "message": "Mobile number verified successfully."
    }
