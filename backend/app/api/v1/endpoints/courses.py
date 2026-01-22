from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
from app.core.database import get_db
from app.models.curriculum import Course as CourseModel
from app.schemas import course as course_schemas

router = APIRouter()

@router.get("/", response_model=List[course_schemas.Course])
def read_courses(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve courses.
    """
    courses = db.query(CourseModel).offset(skip).limit(limit).all()
    return courses

@router.post("/", response_model=course_schemas.Course)
def create_course(
    *,
    db: Session = Depends(get_db),
    course_in: course_schemas.CourseCreate,
) -> Any:
    """
    Create new course.
    """
    course = CourseModel(
        title=course_in.title,
        description=course_in.description,
        level=course_in.level,
        thumbnail_url=course_in.thumbnail_url,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

@router.get("/{course_id}", response_model=course_schemas.Course)
def read_course(
    course_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get course by ID.
    """
    course = db.query(CourseModel).filter(CourseModel.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
