from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any
from app.core.database import get_db
from app.models.curriculum import Lesson as LessonModel
from app.schemas import course as course_schemas

router = APIRouter()

@router.get("/{lesson_id}", response_model=course_schemas.Lesson)
def read_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get lesson by ID.
    """
    lesson = db.query(LessonModel).filter(LessonModel.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson
