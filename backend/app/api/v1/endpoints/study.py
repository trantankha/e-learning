from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.schemas import study as schemas
from app.services import study_service
from app.models.vocabulary import Vocabulary

router = APIRouter()

@router.post("/submit-word", response_model=schemas.UserWordProgressOut)
def submit_word_progress(
    submit_data: schemas.WordSubmit,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Submit word review result (correct/incorrect).
    Updates SRS level and next review date.
    """
    # Verify word exists
    word = db.query(Vocabulary).filter(Vocabulary.id == submit_data.word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")
        
    progress = study_service.submit_word_progress(db, current_user.id, submit_data)
    return progress

@router.get("/review-today", response_model=List[schemas.WordReviewResponse])
def get_words_to_review(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get words scheduled for review today or overdue.
    """
    progress_list = study_service.get_words_due_for_review(db, current_user.id)
    result = []
    for p in progress_list:
        result.append({
            "word": p.vocabulary,
            "progress": p
        })
    return result

@router.post("/words", response_model=schemas.VocabularyOut)
def create_vocabulary_entry(
    word_in: schemas.VocabularyCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new vocabulary word (For testing/admin purposes).
    """
    # Ideally restrict to admin
    # if current_user.role != UserRole.ADMIN: ...
    
    existing = db.query(Vocabulary).filter(Vocabulary.word == word_in.word).first()
    if existing:
        raise HTTPException(status_code=400, detail="Word already exists")
    
    new_word = Vocabulary(**word_in.dict())
    db.add(new_word)
    db.commit()
    db.refresh(new_word)
    return new_word
