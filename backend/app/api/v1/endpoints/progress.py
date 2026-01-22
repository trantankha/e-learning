from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.progress import LessonProgress
from app.models.user import StudentProfile, User
from app.models.curriculum import Lesson
from app.schemas.progress import ProgressUpdate, ProgressResponse
from app.api import deps
from app.services import study_service
from datetime import datetime

router = APIRouter()

@router.post("/mark-complete", response_model=ProgressResponse)
def mark_lesson_complete(
    data: ProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # 1. Find Student Profile associated with User
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found for this user")

    # 2. Find or Create LessonProgress
    progress = db.query(LessonProgress).filter(
        LessonProgress.student_id == student.id,
        LessonProgress.lesson_id == data.lesson_id
    ).first()

    # 3. Calculate Rewards (Only if not already completed)
    earned_gems = 0
    earned_stars = 0
    
    # Check if this is the first time completing
    is_first_completion = False
    if not progress:
        progress = LessonProgress(
            student_id=student.id,
            lesson_id=data.lesson_id,
            is_completed=True,
            updated_at=datetime.utcnow()
        )
        db.add(progress)
        is_first_completion = True
    else:
        if not progress.is_completed:
            progress.is_completed = True
            is_first_completion = True
        progress.updated_at = datetime.utcnow()
    
    # Reward Logic & SRS Trigger
    if is_first_completion:
        # A. Trigger SRS Initialization
        lesson = db.query(Lesson).filter(Lesson.id == data.lesson_id).first()
        if lesson and lesson.vocabulary:
            # lesson.vocabulary is expected to be a list of strings ["Cat", "Dog"]
            study_service.initialize_lesson_vocabulary(db, current_user.id, lesson.vocabulary)

        # B. Calculate Score/Rewards
        pass_threshold = 0.6  # Lowered from 0.8 to 60% (3/5 câu trở lên)
        performance = 0
        if data.total_questions > 0:
            performance = data.score / data.total_questions
        else:
            # If no questions (video only), purely completion = 100%
            performance = 1.0
        
        if performance >= pass_threshold:
            earned_gems = 10
            earned_stars = 3
            student.total_gems += earned_gems
            student.total_stars += earned_stars
            db.add(student)

    db.commit()
    db.refresh(progress)

    return ProgressResponse(
        message="Lesson marked as complete",
        is_completed=progress.is_completed,
        updated_at=progress.updated_at,
        earned_gems=earned_gems,
        earned_stars=earned_stars
    )
