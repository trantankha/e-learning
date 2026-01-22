from datetime import datetime, date
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api import deps
from app.models.user import User, StudentProfile
from app.schemas.user import PasswordChange, UserProfileUpdate
from app.core.security import verify_password, get_password_hash
from pydantic import BaseModel

router = APIRouter()

class StudentProfileSchema(BaseModel):
    total_gems: int
    total_stars: int
    date_of_birth: Optional[date] = None
    avatar_url: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: int
    email: str
    full_name: str
    referral_code: Optional[str] = None
    student_profile: StudentProfileSchema

@router.get("/profile", response_model=UserProfileResponse)
def read_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin học sinh!")
    
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name or "Bé yêu",
        referral_code=current_user.referral_code,
        student_profile=StudentProfileSchema(
            total_gems=student.total_gems,
            total_stars=student.total_stars,
            date_of_birth=student.date_of_birth.date() if student.date_of_birth else None,
            avatar_url=student.avatar_url
        )
    )

@router.put("/profile", response_model=UserProfileResponse)
def update_user_profile(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
    user_in: UserProfileUpdate
) -> Any:
    """
    Update user profile information.
    """
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin học sinh!")

    # Update User Info
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    
    # Update Student Profile Info
    if user_in.date_of_birth is not None:
         # Assuming user_in.date_of_birth comes as ISO string 'YYYY-MM-DD'
        try:
            student.date_of_birth = datetime.strptime(user_in.date_of_birth, "%Y-%m-%d")
        except ValueError:
             # Basic fallback or you could rely on Pydantic to parse it if typed as date
             pass
    
    if user_in.avatar_url is not None:
        student.avatar_url = user_in.avatar_url

    db.add(current_user)
    db.add(student)
    db.commit()
    db.refresh(current_user)
    db.refresh(student)

    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        referral_code=current_user.referral_code,
        student_profile=StudentProfileSchema(
            total_gems=student.total_gems,
            total_stars=student.total_stars,
             date_of_birth=student.date_of_birth.date() if student.date_of_birth else None,
            avatar_url=student.avatar_url
        )
    )

@router.put("/profile/password", response_model=Any)
def change_password(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
    password_in: PasswordChange
) -> Any:
    """
    Update user password.
    """
    if not verify_password(password_in.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không chính xác!")
    
    if password_in.new_password == password_in.current_password:
        raise HTTPException(status_code=400, detail="Mật khẩu mới không nên trùng với mật khẩu hiện tại!")

    hashed_password = get_password_hash(password_in.new_password)
    current_user.hashed_password = hashed_password
    
    db.add(current_user)
    db.commit()
    
    return {"message": "Đổi mật khẩu thành công!"}
