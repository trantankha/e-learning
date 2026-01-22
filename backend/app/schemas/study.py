from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class VocabularyBase(BaseModel):
    word: str
    meaning: Optional[str] = None
    pronunciation: Optional[str] = None
    example_sentence: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    lesson_id: Optional[int] = None

class VocabularyCreate(VocabularyBase):
    pass

class VocabularyOut(VocabularyBase):
    id: int
    
    class Config:
        from_attributes = True

class UserWordProgressBase(BaseModel):
    word_id: int
    box_level: int
    next_review_at: datetime
    last_reviewed_at: Optional[datetime] = None

class UserWordProgressOut(UserWordProgressBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

class WordSubmit(BaseModel):
    word_id: int
    is_correct: bool

class WordReviewResponse(BaseModel):
    word: VocabularyOut
    progress: UserWordProgressOut
