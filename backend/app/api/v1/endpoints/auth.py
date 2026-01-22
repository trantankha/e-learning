from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from app.services.email_service import email_service
from app.services.tasks import send_welcome_email_task
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User, StudentProfile
from app.schemas.token import Token
from app.schemas.user import UserCreate, User as UserSchema

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    # OAuth2PasswordRequestForm expects 'username' field (mapped to email)
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=400, 
            detail="Tài khoản hoặc mật khẩu không đúng"
        )
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Tài khoản không hoạt động")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserSchema)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    background_tasks: BackgroundTasks
) -> Any:
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="Tài khoản đã tồn tại.",
        )
    user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_active=True
    )
    
    # Generate Referral Code
    import uuid
    # Format: NAME + RANDOM. Simple: First name + random chars or just Random
    # Let's use simplified unique string for now: e.g. "NAME1234" or Random
    # Strategy: 4 chars from UUID + 4 chars random? 
    # Or just "REF" + 6 chars
    ref_part = f"{uuid.uuid4().hex[:6].upper()}"
    # Try to make it a bit personalized if possible, but safe fallback
    import re
    # naive slugify name
    clean_name = re.sub(r'[^a-zA-Z0-9]', '', user_in.full_name)[:3].upper()
    if not clean_name: clean_name = "USER"
    user.referral_code = f"{clean_name}{ref_part}"
    
    # Process Referral (If provided)
    referrer = None
    if user_in.ref_code:
        referrer = db.query(User).filter(User.referral_code == user_in.ref_code).first()
        if referrer:
            user.referred_by = referrer.id
            
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create default Student Profile linked to this user
    # If Referred, add 100 Gems immediately to self (Referee)
    initial_gems = 100 if referrer else 0
    
    student_profile = StudentProfile(
        user_id=user.id,
        total_stars=0,
        total_gems=initial_gems
    )
    db.add(student_profile)
    
    # Add Reward to Referrer
    if referrer and referrer.student_profile:
        referrer.student_profile.total_gems += 100
        # Optional: Add PointLog or Notification logic here
        db.add(referrer.student_profile)
        
    db.commit()
    
    
    # Send Welcome Email
    try:
        if settings.MAIL_USERNAME and "your-email" not in settings.MAIL_USERNAME:
            # background_tasks.add_task(email_service.send_welcome_email, user.email, user.full_name)
            send_welcome_email_task.delay(user.email, user.full_name)
    except Exception as e:
        print(f"Failed to send email: {e}")

    return user
