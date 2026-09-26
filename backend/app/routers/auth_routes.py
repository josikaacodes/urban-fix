from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import (
    UserLogin, UserRegister, Token, UserResponse,
    MobileSendOTPRequest, MobileVerifyOTPRequest,
    IdentitySendOTPRequest, IdentityVerifyOTPRequest
)
from ..auth import get_current_user
from ..services.auth_service import authenticate_user, register_citizen
from ..services.mobile_verification_service import send_mobile_otp, verify_mobile_otp
from ..services.identity_verification_service import send_identity_otp, verify_identity

router = APIRouter()

@router.post("/register", response_model=Token)
def register(req: UserRegister, db: Session = Depends(get_db)):
    res = register_citizen(db, req)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])
    return {"access_token": res["token"], "token_type": "bearer", "user": res["user"]}

@router.post("/login", response_model=Token)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    res = authenticate_user(db, creds)
    if not res["success"]:
        raise HTTPException(status_code=401, detail=res["error"])
    return {"access_token": res["token"], "token_type": "bearer", "user": res["user"]}

@router.post("/mobile/send-otp")
def mobile_send_otp(req: MobileSendOTPRequest):
    return send_mobile_otp(req.mobile)

@router.post("/mobile/verify-otp")
def mobile_verify(req: MobileVerifyOTPRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = verify_mobile_otp(db, current_user, req.mobile, req.otp)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@router.post("/identity/send-otp")
def identity_send_otp(req: IdentitySendOTPRequest):
    res = send_identity_otp(req.id_number)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@router.post("/identity/verify")
def identity_verify(req: IdentityVerifyOTPRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = verify_identity(db, current_user, req.id_number, req.otp, req.consent_given)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    city = "Chennai"
    ward = "Porur"
    anon = False
    if current_user.profile:
        city = current_user.profile.city
        ward = current_user.profile.ward
        anon = current_user.profile.anonymous_reporting_enabled
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        mobile=current_user.mobile,
        role=current_user.role,
        mobile_verified=current_user.mobile_verified,
        identity_verified=current_user.identity_verified,
        created_at=current_user.created_at,
        city=city,
        ward=ward,
        anonymous_reporting_enabled=anon
    )
