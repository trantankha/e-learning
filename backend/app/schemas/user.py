from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    is_active: Optional[bool] = True
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    ref_code: Optional[str] = None

class UserUpdate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: int
    referral_code: Optional[str] = None
    
    class Config:
        from_attributes = True

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None # ISO format string or use date
    avatar_url: Optional[str] = None

