from typing import Any, List, Optional
from enum import Enum
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.api import deps
from app.core.database import get_db
from app.models.user import User, StudentProfile
from app.models.gamification import PointLog, CurrencyType
from app.schemas.leaderboard import LeaderboardResponse, LeaderboardEntry

router = APIRouter()

class LeaderboardPeriod(str, Enum):
    ALL_TIME = "all_time"
    WEEKLY = "weekly"

@router.get("/", response_model=LeaderboardResponse)
def get_leaderboard(
    period: LeaderboardPeriod = Query(LeaderboardPeriod.ALL_TIME),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get leaderboard data (Top 10 users).
    """
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="User is not a student")

    current_student_id = current_user.student_profile.id
    
    top_entries = []
    user_rank_entry = None

    if period == LeaderboardPeriod.ALL_TIME:
        # Query Top 10 by total_stars
        top_students = (
            db.query(StudentProfile)
            .join(User, StudentProfile.user_id == User.id)
            .order_by(desc(StudentProfile.total_stars))
            .limit(10)
            .all()
        )
        
        # Build response list
        for idx, student in enumerate(top_students):
            entry = LeaderboardEntry(
                rank=idx + 1,
                student_id=student.id,
                full_name=student.user.full_name,
                avatar_url=student.avatar_url,
                stars=student.total_stars,
                is_current_user=(student.id == current_student_id)
            )
            top_entries.append(entry)
            if entry.is_current_user:
                user_rank_entry = entry

        # If user not in top 10, calculate their rank
        if not user_rank_entry:
            user_stars = current_user.student_profile.total_stars
            better_count = (
                db.query(StudentProfile)
                .filter(StudentProfile.total_stars > user_stars)
                .count()
            )
            user_rank_entry = LeaderboardEntry(
                rank=better_count + 1,
                student_id=current_student_id,
                full_name=current_user.full_name,
                avatar_url=current_user.student_profile.avatar_url,
                stars=user_stars,
                is_current_user=True
            )

    else: # Weekly
        start_date = datetime.utcnow() - timedelta(days=7)
        
        # Subquery to calculate weekly stars per student
        # We assume PointLog tracks positive star changes
        weekly_scores = (
            db.query(
                PointLog.student_id,
                func.sum(PointLog.change_amount).label("weekly_stars")
            )
            .filter(
                PointLog.created_at >= start_date,
                PointLog.currency_type == CurrencyType.STAR,
                PointLog.change_amount > 0 
            )
            .group_by(PointLog.student_id)
            .order_by(desc("weekly_stars"))
            .all()
        )
        
        # Map results to full profiles
        # Since we need full name, we might need to fetch profiles.
        # Given limit 10, we can fetch manually or do a more complex join.
        # Let's do simple fetch for the top 10.
        
        top_scores = weekly_scores[:10]
        
        for idx, (s_id, score) in enumerate(top_scores):
            student = db.query(StudentProfile).filter(StudentProfile.id == s_id).first()
            if student:
                 entry = LeaderboardEntry(
                    rank=idx + 1,
                    student_id=s_id,
                    full_name=student.user.full_name,
                    avatar_url=student.avatar_url,
                    stars=score or 0,
                    is_current_user=(s_id == current_student_id)
                )
                 top_entries.append(entry)
                 if entry.is_current_user:
                     user_rank_entry = entry

        # Logic for user if not in top 10
        if not user_rank_entry:
            # Find user's score in the full list
            # Optimize: querying all grouped by is heavy if many users. 
            # For MVP, fetching user's specific sum is faster.
            
            user_weekly_score = (
                db.query(func.sum(PointLog.change_amount))
                .filter(
                    PointLog.student_id == current_student_id,
                    PointLog.created_at >= start_date,
                    PointLog.currency_type == CurrencyType.STAR,
                    PointLog.change_amount > 0
                )
                .scalar()
            ) or 0
            
            # Find rank: Count users with score > user_weekly_score
            # This requires a subquery or having clause.
            #   SELECT count(*) FROM (SELECT sum(amount) as s FROM logs GROUP BY student_id) WHERE s > my_score
            
            subquery = (
                db.query(func.sum(PointLog.change_amount).label("score"))
                .filter(
                    PointLog.created_at >= start_date,
                    PointLog.currency_type == CurrencyType.STAR,
                    PointLog.change_amount > 0
                )
                .group_by(PointLog.student_id)
                .subquery()
            )
            
            better_count = db.query(func.count()).filter(subquery.c.score > user_weekly_score).scalar()
            
            user_rank_entry = LeaderboardEntry(
                rank=better_count + 1,
                student_id=current_student_id,
                full_name=current_user.full_name,
                avatar_url=current_user.student_profile.avatar_url,
                stars=user_weekly_score,
                is_current_user=True
            )

    return LeaderboardResponse(
        top_users=top_entries,
        user_rank=user_rank_entry
    )
