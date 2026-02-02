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
from app.models.progress import LessonProgress, QuizResult

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

    earned_gems = 0
    earned_stars = 0
    
    # 3. Determine Pass/Completion Status
    # - If total_questions == 0 (Video only): Always passed/completed
    # - If total_questions > 0 (Quiz): Passed only if score >= threshold
    
    passed_quiz = False
    is_lesson_passed = False
    
    if data.total_questions > 0:
        pass_threshold = 0.6
        performance = data.score / data.total_questions
        if performance >= pass_threshold:
            passed_quiz = True
            is_lesson_passed = True
    else:
        # Video completion
        is_lesson_passed = True

    # 4. Update LessonProgress (Completion Logic - Gems)
    is_newly_completed = False
    
    if not progress:
        progress = LessonProgress(
            student_id=student.id,
            lesson_id=data.lesson_id,
            is_completed=is_lesson_passed, 
            updated_at=datetime.utcnow()
        )
        db.add(progress)
        if is_lesson_passed:
            is_newly_completed = True
    else:
        # Only mark complete if currently passed and not already complete
        if not progress.is_completed and is_lesson_passed:
            progress.is_completed = True
            is_newly_completed = True
        progress.updated_at = datetime.utcnow()
    
    # Award Gems if newly completed (Video watched OR Quiz passed first time)
    if is_newly_completed:
        earned_gems = 10
        student.total_gems += earned_gems
        
        # Trigger SRS Initialization only on first completion
        lesson = db.query(Lesson).filter(Lesson.id == data.lesson_id).first()
        if lesson and lesson.vocabulary:
            study_service.initialize_lesson_vocabulary(db, current_user.id, lesson.vocabulary)

    # 5. Quiz Logic (Stars) - Only if Quiz submitted
    if data.total_questions > 0:
        # Record Quiz Result
        quiz_result = QuizResult(
            student_id=student.id,
            lesson_id=data.lesson_id,
            score=data.score,
            total_questions=data.total_questions,
            passed=passed_quiz,
            created_at=datetime.utcnow()
        )
        db.add(quiz_result)
        
        # Award Stars only if Passed Quiz
        if passed_quiz:
            # Check if user has EVER passed this quiz before
            previously_passed = db.query(QuizResult).filter(
                QuizResult.student_id == student.id,
                QuizResult.lesson_id == data.lesson_id,
                QuizResult.passed == True
            ).count() > 0
            
            if not previously_passed:
                earned_stars = 3
                student.total_stars += earned_stars

    # Save all changes
    db.add(student) # ensure student update is tracked
    db.commit()
    db.refresh(progress)

    return ProgressResponse(
        message="Lesson updated",
        is_completed=progress.is_completed,
        updated_at=progress.updated_at,
        earned_gems=earned_gems,
        earned_stars=earned_stars
    )
