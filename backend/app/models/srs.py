from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class UserWordProgress(Base):
    __tablename__ = 'user_word_progress'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    word_id = Column(Integer, ForeignKey('vocabularies.id'), nullable=False)
    
    box_level = Column(Integer, default=1) # 1 to 5
    next_review_at = Column(DateTime, default=datetime.utcnow)
    last_reviewed_at = Column(DateTime, nullable=True)
    
    user = relationship("User", backref="word_progress")
    vocabulary = relationship("Vocabulary", back_populates="progress_records")

    def __str__(self):
        return f"{self.user_id} - {self.word_id}: Level {self.box_level}"
