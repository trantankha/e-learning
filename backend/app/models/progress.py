from sqlalchemy import Column, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class LessonProgress(Base):
    __tablename__ = 'lesson_progress'

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('student_profiles.id'), nullable=False)
    lesson_id = Column(Integer, ForeignKey('lessons.id'), nullable=False)
    
    is_completed = Column(Boolean, default=False)
    last_watched_position = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="progress")
    lesson = relationship("Lesson", back_populates="progress_records")

    def __str__(self):
        return f"Lesson Progress {self.id} (Student: {self.student_id}, Lesson: {self.lesson_id})"

class QuizResult(Base):
    __tablename__ = 'quiz_results'

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('student_profiles.id'), nullable=False)
    lesson_id = Column(Integer, ForeignKey('lessons.id'), nullable=False)
    
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    passed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="quiz_results")
    lesson = relationship("Lesson", back_populates="quiz_results")

    def __str__(self):
        return f"Quiz Result {self.id} (Score: {self.score}/{self.total_questions})"
