from typing import List, Optional
from pydantic import BaseModel
from app.models.enums import LessonType

class LessonDashboardResponse(BaseModel):
    id: int
    title: str
    lesson_type: LessonType
    thumbnail_url: Optional[str] = None
    order_index: int
    
    # Status
    is_locked: bool = True
    is_completed: bool = False
    score: int = 0

class UnitDashboardResponse(BaseModel):
    id: int
    title: str
    order_index: int
    lessons: List[LessonDashboardResponse]

class DashboardPathResponse(BaseModel):
    units: List[UnitDashboardResponse]
