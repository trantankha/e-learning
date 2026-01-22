from pydantic import BaseModel
from typing import List
from datetime import date

class DailyProgress(BaseModel):
    date: date
    minutes: int

class WeeklyReportResponse(BaseModel):
    total_minutes: int
    lessons_completed: int
    learned_words: List[str]
    weak_words: List[str]
    daily_chart: List[DailyProgress]
