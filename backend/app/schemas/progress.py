from pydantic import BaseModel
from datetime import datetime

class ProgressUpdate(BaseModel):
    lesson_id: int
    score: int = 0
    total_questions: int = 0

class ProgressResponse(BaseModel):
    message: str
    is_completed: bool
    updated_at: datetime
    earned_gems: int = 0
    earned_stars: int = 0
