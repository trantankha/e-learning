from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc

from app.core.database import get_db
from app.api import deps
from app.models.user import User, StudentProfile
from app.models.curriculum import Unit, Lesson
from app.models.progress import LessonProgress, QuizResult
from app.schemas.dashboard import DashboardPathResponse, UnitDashboardResponse, LessonDashboardResponse

router = APIRouter()

@router.get("/path", response_model=DashboardPathResponse)
def get_learning_path(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    # 1. Get Student Profile
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # 2. Fetch all Units and Lessons (Assuming single course for now or filtering by level/course needed in future)
    # For MVP, we fetch all units ordered by index
    units = db.query(Unit).order_by(asc(Unit.order_index)).all()

    # 3. Fetch User Progress maps
    progress_records = db.query(LessonProgress).filter(LessonProgress.student_id == student.id).all()
    completed_map = {p.lesson_id: p.is_completed for p in progress_records}
    
    quiz_records = db.query(QuizResult).filter(QuizResult.student_id == student.id).all()
    score_map = {q.lesson_id: q.score for q in quiz_records}

    # 4. Build Response with Lock Logic
    units_response = []
    
    # Global sequential lock tracker
    # The first lesson of the first unit is always unlocked.
    # Subsequent lessons are unlocked ONLY if the previous one is completed.
    previous_lesson_completed = True 

    for unit in units:
        lessons_response = []
        # Sort lessons within unit just in case
        sorted_lessons = sorted(unit.lessons, key=lambda x: x.order_index)
        
        for lesson in sorted_lessons:
            is_completed = completed_map.get(lesson.id, False)
            score = score_map.get(lesson.id, 0)
            
            # Determine Lock Status
            is_locked = not previous_lesson_completed
            
            # Update tracker for next iteration
            # If THIS lesson is completed, the NEXT one will be unlocked.
            # If this lesson is NOT completed, the next one stays locked.
            previous_lesson_completed = is_completed

            lessons_response.append(LessonDashboardResponse(
                id=lesson.id,
                title=lesson.title,
                lesson_type=lesson.lesson_type,
                thumbnail_url=lesson.thumbnail_url,
                order_index=lesson.order_index,
                is_locked=is_locked,
                is_completed=is_completed,
                score=score
            ))
        
        units_response.append(UnitDashboardResponse(
            id=unit.id,
            title=unit.title,
            order_index=unit.order_index,
            lessons=lessons_response
        ))

    return DashboardPathResponse(units=units_response)
