from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Vocabulary(Base):
    __tablename__ = 'vocabularies'

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, unique=True, index=True, nullable=False)
    meaning = Column(String, nullable=True)
    pronunciation = Column(String, nullable=True)
    example_sentence = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)
    
    # Optional link to a specific lesson, though words can be independent
    lesson_id = Column(Integer, ForeignKey('lessons.id'), nullable=True)
    
    lesson = relationship("Lesson", backref="vocab_list")
    progress_records = relationship("UserWordProgress", back_populates="vocabulary")

    def __str__(self):
        return self.word
