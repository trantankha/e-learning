from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.srs import UserWordProgress
from app.models.vocabulary import Vocabulary
from app.schemas.study import WordSubmit

def calculate_next_review(current_level: int, is_correct: bool):
    """
    Calculates the next review date and new box level based on correctness.
    Logic:
    - Level 1: 1 day
    - Level 2: 3 days
    - Level 3: 7 days
    - Level 4: 15 days
    - Level 5: 30 days
    """
    if not is_correct:
        return 1, datetime.utcnow() + timedelta(days=1)
    
    intervals = {
        1: 1,
        2: 3,
        3: 7,
        4: 15,
        5: 30
    }
    
    # If correct, increase level (max 5)
    new_level = min(current_level + 1, 5)
    
    # In case current_level was 0 or newly initialized, treat as level 1->2 transition logic potentially
    # But usually if it's new (level 0 or non-existent), it starts at level 1.
    # Here we assume current_level is the level *before* this review session.
    
    days_to_add = intervals.get(new_level, 30)
    next_review = datetime.utcnow() + timedelta(days=days_to_add)
    
    return new_level, next_review

def get_or_create_progress(db: Session, user_id: int, word_id: int) -> UserWordProgress:
    progress = db.query(UserWordProgress).filter(
        UserWordProgress.user_id == user_id,
        UserWordProgress.word_id == word_id
    ).first()
    
    if not progress:
        progress = UserWordProgress(
            user_id=user_id,
            word_id=word_id,
            box_level=1,
            next_review_at=datetime.utcnow()
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)
        
    return progress

def submit_word_progress(db: Session, user_id: int, submit_data: WordSubmit) -> UserWordProgress:
    progress = get_or_create_progress(db, user_id, submit_data.word_id)
    
    new_level, next_review = calculate_next_review(progress.box_level, submit_data.is_correct)
    
    # If incorrect, reset to level 1 (or keep at 1), review tomorrow
    if not submit_data.is_correct:
         new_level = 1
         next_review = datetime.utcnow() + timedelta(days=1)
    
    progress.box_level = new_level
    progress.next_review_at = next_review
    progress.last_reviewed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(progress)
    return progress

def get_words_due_for_review(db: Session, user_id: int, limit: int = 20):
    now = datetime.utcnow()
    return db.query(UserWordProgress).filter(
        UserWordProgress.user_id == user_id,
        UserWordProgress.next_review_at <= now
    ).limit(limit).all()

def initialize_lesson_vocabulary(db: Session, user_id: int, vocab_list: list[str]):
    """
    Initialize SRS progress for a list of words strings (from a lesson).
    Finds the Vocabulary IDs and creates progress entries if missing.
    """
    if not vocab_list:
        return
        
    # 1. Find Vocabulary IDs for these words
    vocab_entities = db.query(Vocabulary).filter(Vocabulary.word.in_(vocab_list)).all()
    
    for vocab in vocab_entities:
        # Check if progress already exists
        exists = db.query(UserWordProgress).filter(
            UserWordProgress.user_id == user_id,
            UserWordProgress.word_id == vocab.id
        ).first()
        
        if not exists:
            # Create new progress entry (Level 1, Review Today/Now)
            new_progress = UserWordProgress(
                user_id=user_id,
                word_id=vocab.id,
                box_level=1,
                next_review_at=datetime.utcnow() 
            )
            db.add(new_progress)
    
    db.commit()
