from sqlalchemy.orm import Session
from ..models import User, CitizenProfile
from ..auth import get_password_hash, verify_password, create_access_token
from ..schemas import UserRegister, UserLogin
from datetime import datetime

def register_citizen(db: Session, reg: UserRegister) -> dict:
    existing = db.query(User).filter((User.email == reg.email) | (User.mobile == reg.mobile)).first()
    if existing:
        return {"success": False, "error": "User with this email or mobile already exists."}
    
    user = User(
        name=reg.name,
        email=reg.email.lower(),
        mobile=reg.mobile,
        password_hash=get_password_hash(reg.password),
        role="citizen",
        mobile_verified=False,
        identity_verified=False,
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    profile = CitizenProfile(
        user_id=user.id,
        city=reg.city or "Chennai",
        ward=reg.ward or "Ward 142 - Porur",
        anonymous_reporting_enabled=False
    )
    db.add(profile)
    db.commit()
    
    token = create_access_token({"sub": user.id, "role": user.role, "email": user.email})
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "mobile": user.mobile,
            "role": user.role,
            "mobile_verified": user.mobile_verified,
            "identity_verified": user.identity_verified,
            "city": profile.city,
            "ward": profile.ward
        }
    }

def authenticate_user(db: Session, creds: UserLogin) -> dict:
    login_str = creds.email_or_mobile.strip().lower()
    user = db.query(User).filter((User.email == login_str) | (User.mobile == login_str)).first()
    
    if not user or not verify_password(creds.password, user.password_hash):
        return {"success": False, "error": "Invalid email/mobile or password."}
        
    token = create_access_token({"sub": user.id, "role": user.role, "email": user.email})
    
    city = "Chennai"
    ward = "Porur"
    if user.profile:
        city = user.profile.city
        ward = user.profile.ward
        
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "mobile": user.mobile,
            "role": user.role,
            "mobile_verified": user.mobile_verified,
            "identity_verified": user.identity_verified,
            "city": city,
            "ward": ward
        }
    }
