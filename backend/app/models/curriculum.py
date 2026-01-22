from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from .enums import CourseLevel, LessonType

class Course(Base):
    __tablename__ = 'courses'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    level = Column(Enum(CourseLevel), nullable=False)
    thumbnail_url = Column(String, nullable=True)

    units = relationship("Unit", back_populates="course", cascade="all, delete-orphan")

    def __str__(self):
        return self.title

class Unit(Base):
    __tablename__ = 'units'

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey('courses.id'), nullable=False)
    title = Column(String, nullable=False)
    order_index = Column(Integer, nullable=False)

    course = relationship("Course", back_populates="units")
    lessons = relationship("Lesson", back_populates="unit", cascade="all, delete-orphan")

    def __str__(self):
        return self.title

class Lesson(Base):
    __tablename__ = 'lessons'

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey('units.id'), nullable=False)
    title = Column(String, nullable=False)
    lesson_type = Column(Enum(LessonType), nullable=False)
    order_index = Column(Integer, nullable=False)
    
    # Multimedia fields
    thumbnail_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    attachment_url = Column(String, nullable=True)
    pronunciation_word = Column(String, nullable=True) # Keyword for practice (e.g. "Cat")
    vocabulary = Column(JSON, nullable=True) # List of words: ["Cat", "Dog"]

    unit = relationship("Unit", back_populates="lessons")
    video_material = relationship("VideoMaterial", back_populates="lesson", uselist=False, cascade="all, delete-orphan")
    progress_records = relationship("LessonProgress", back_populates="lesson")
    quiz_results = relationship("QuizResult", back_populates="lesson")
    questions = relationship("Question", back_populates="lesson", cascade="all, delete-orphan")

    def __str__(self):
        return self.title

class VideoMaterial(Base):
    __tablename__ = 'video_materials'

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey('lessons.id'), unique=True, nullable=False)
    video_url = Column(String, nullable=False)
    duration_seconds = Column(Integer, default=0)
    transcript = Column(Text, nullable=True)

    lesson = relationship("Lesson", back_populates="video_material")

class Question(Base):
    __tablename__ = 'questions'

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey('lessons.id'), nullable=False)
    text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False) # List of strings: ["Cat", "Dog", "Bird"]
    correct_answer = Column(String, nullable=False) # "Cat"
    order_index = Column(Integer, default=0)

    lesson = relationship("Lesson", back_populates="questions")

    def __str__(self):
        return self.text
