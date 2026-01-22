from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from .enums import UserRole

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    referral_code = Column(String, unique=True, index=True, nullable=True)
    referred_by = Column(Integer, ForeignKey('users.id'), nullable=True)

    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    parent_profile = relationship("ParentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")

    def __str__(self):
        return self.email or self.full_name

class ParentProfile(Base):
    __tablename__ = 'parent_profiles'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    phone_number = Column(String, nullable=True)

    user = relationship("User", back_populates="parent_profile")
    students = relationship("StudentProfile", back_populates="parent")

class StudentProfile(Base):
    __tablename__ = 'student_profiles'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    parent_id = Column(Integer, ForeignKey('parent_profiles.id'), nullable=True)
    
    date_of_birth = Column(DateTime, nullable=True)
    avatar_url = Column(String, nullable=True)
    total_gems = Column(Integer, default=0)
    total_stars = Column(Integer, default=0)

    user = relationship("User", back_populates="student_profile")
    parent = relationship("ParentProfile", back_populates="students")
    progress = relationship("LessonProgress", back_populates="student", cascade="all, delete-orphan")
    quiz_results = relationship("QuizResult", back_populates="student", cascade="all, delete-orphan")
    inventory = relationship("UserItem", back_populates="student", cascade="all, delete-orphan")
    shop_inventory = relationship("Inventory", back_populates="student_profile", cascade="all, delete-orphan")
    point_logs = relationship("PointLog", back_populates="student", cascade="all, delete-orphan")

    def __str__(self):
        return f"Student Profile {self.id} - Gems: {self.total_gems}"
