from pydantic import BaseModel
from typing import List, Optional
from app.models.enums import CourseLevel, LessonType

# Shared properties
class QuestionBase(BaseModel):
    text: str
    options: List[str]
    correct_answer: str
    order_index: int = 0

class Question(QuestionBase):
    id: int
    lesson_id: int

    class Config:
        from_attributes = True

class LessonBase(BaseModel):
    title: str
    lesson_type: LessonType
    order_index: int
    thumbnail_url: Optional[str] = None
    video_url: Optional[str] = None
    attachment_url: Optional[str] = None
    pronunciation_word: Optional[str] = None

class LessonCreate(LessonBase):
    unit_id: int

class Lesson(LessonBase):
    id: int
    unit_id: int
    questions: List[Question] = []

    class Config:
        from_attributes = True

class UnitBase(BaseModel):
    title: str
    order_index: int

class UnitCreate(UnitBase):
    course_id: int

class Unit(UnitBase):
    id: int
    lessons: List[Lesson] = []

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    level: CourseLevel
    thumbnail_url: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int
    units: List[Unit] = []

    class Config:
        from_attributes = True
