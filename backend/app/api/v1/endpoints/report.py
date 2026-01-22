from typing import Any
from datetime import datetime, timedelta, date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.models.user import User
from app.models.progress import LessonProgress, QuizResult
from app.models.curriculum import Lesson, VideoMaterial
from app.schemas.report import WeeklyReportResponse, DailyProgress

router = APIRouter()

@router.get("/weekly", response_model=WeeklyReportResponse)
def get_weekly_report(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get weekly learning report for the current user.
    """
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="User is not a student")

    student_id = current_user.student_profile.id
    
    # Calculate date range (Last 7 days)
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=6) # 7 days including today
    start_datetime = datetime.combine(start_date, datetime.min.time())

    # 1. Calculate Daily Progress (Minutes)
    # Strategy: 
    # - Fetch modified progress records in the last 7 days.
    # - Estimate time: 
    #   - If completed: use video duration (or default 10 mins if missing)
    #   - If not completed: use last_watched_position (seconds)
    # - Note: This is an estimation. Real tracking would require a detailed session log.
    
    progress_records = (
        db.query(LessonProgress, Lesson, VideoMaterial)
        .join(Lesson, LessonProgress.lesson_id == Lesson.id)
        .outerjoin(VideoMaterial, Lesson.id == VideoMaterial.lesson_id)
        .filter(
            LessonProgress.student_id == student_id,
            LessonProgress.updated_at >= start_datetime
        )
        .all()
    )

    # Initialize daily map
    daily_map = {start_date + timedelta(days=i): 0 for i in range(7)}
    learned_words = set()
    total_minutes = 0
    lessons_completed = 0

    for prog, lesson, video in progress_records:
        day = prog.updated_at.date()
        if day < start_date: continue # Should be filtered by DB query, but safe check
        
        # Calculate duration in seconds
        duration = 0
        if prog.is_completed:
            lessons_completed += 1
            if lesson.pronunciation_word:
                learned_words.add(lesson.pronunciation_word)
            
            # Use video duration if avail, else guess 5 mins
            if video and video.duration_seconds:
                duration = video.duration_seconds
            else:
                duration = 300 # 5 mins default
        else:
            # In-progress: use watched position
            duration = prog.last_watched_position or 0

        minutes = duration // 60
        if day in daily_map:
            daily_map[day] += minutes
        total_minutes += minutes

    # Format chart data
    daily_chart = [
        DailyProgress(date=d, minutes=m) 
        for d, m in daily_map.items()
    ]
    # Sort by date
    daily_chart.sort(key=lambda x: x.date)

    # 2. Identify Weak Words (Low Quiz Scores)
    # Filter: created_at >= start_datetime, score/total < 0.6
    weak_words_query = (
        db.query(Lesson.pronunciation_word)
        .join(QuizResult, QuizResult.lesson_id == Lesson.id)
        .filter(
            QuizResult.student_id == student_id,
            QuizResult.created_at >= start_datetime,
            Lesson.pronunciation_word.isnot(None)
        )
        .all()
    )
    
    # We need to filter based on score ratio in python or complex SQL
    # Let's fetch results and filter python side for simplicity (assuming volume is low per week)
    quiz_results = (
        db.query(QuizResult, Lesson)
        .join(Lesson, QuizResult.lesson_id == Lesson.id)
        .filter(
            QuizResult.student_id == student_id,
            QuizResult.created_at >= start_datetime
        )
        .all()
    )

    weak_words_set = set()
    for qr, lesson in quiz_results:
        if qr.total_questions > 0:
            ratio = qr.score / qr.total_questions
            if ratio < 0.6 and lesson.pronunciation_word:
                 weak_words_set.add(lesson.pronunciation_word)

    return WeeklyReportResponse(
        total_minutes=total_minutes,
        lessons_completed=lessons_completed,
        learned_words=list(learned_words),
        weak_words=list(weak_words_set),
        daily_chart=daily_chart
    )
