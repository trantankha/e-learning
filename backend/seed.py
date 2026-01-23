import json
import os
import sys
from app.core.database import SessionLocal, init_db, engine, Base
from app.models.user import User, StudentProfile
from app.models.curriculum import Course, Unit, Lesson, Question
from app.models.shop import ShopItem
from app.models.gem_pack import GemPack
from app.models.enums import UserRole, CourseLevel, LessonType, ItemCategory
from app.models.vocabulary import Vocabulary
from app.models.srs import UserWordProgress
from datetime import datetime, timedelta
from app.core import security
from app.models.enums import UserRole, ItemCategory

# Define base path to allow imports from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# --- Constants & Mappings ---
LEVEL_MAP = {
    "L1": CourseLevel.STARTERS,
    "L2": CourseLevel.MOVERS,
}

LESSON_TYPE_MAP = {
    "Vocabulary": LessonType.VOCABULARY,
    "Grammar": LessonType.GRAMMAR,
    "Phonics": LessonType.PHONICS,
    "Listening": LessonType.LISTENING,
    "Quiz": LessonType.QUIZ
}

FIXTURES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app", "fixtures")

def load_json_fixture(filename):
    path = os.path.join(FIXTURES_DIR, filename)
    if not os.path.exists(path):
        print(f"Warning: Fixture {filename} not found at {path}")
        return []
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def seed_users(db):
    print("\n--- [1/3] Seeding Users ---")
    try:
        # Admin
        if not db.query(User).filter(User.email == "admin@kidseng.com").first():
            admin = User(
                email="admin@kidseng.com",
                hashed_password=security.get_password_hash("admin123"),
                full_name="System Admin",
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            print("Created Admin: admin@kidseng.com")
        
        # Student
        if not db.query(User).filter(User.email == "student@example.com").first():
            student = User(
                email="student@example.com",
                hashed_password=security.get_password_hash("student123"),
                full_name="Bé Học Giỏi",
                role=UserRole.STUDENT,
                is_active=True
            )
            db.add(student)
            db.commit() # Commit needed to get ID
            db.refresh(student)
            
            profile = StudentProfile(user_id=student.id, total_stars=0, total_gems=0)
            db.add(profile)
            print("Created Student: student@example.com")
            
        db.commit()
    except Exception as e:
        print(f"Error seeding users: {e}")

def seed_curriculum(db):
    print("\n--- [2/3] Seeding Curriculum ---")
    
    # Try loading unified curriculum or generated one
    units_data = load_json_fixture("curriculum_generated.json")
    
    if not units_data:
        print("No curriculum data found.")
        return

    try:
        # Create Course: Starters
        course = db.query(Course).filter(Course.level == CourseLevel.STARTERS).first()
        if not course:
            course = Course(
                title="Starters (Pre-A1)",
                description="Làm quen với tiếng Anh, từ vựng cơ bản và câu đơn giản.",
                level=CourseLevel.STARTERS,
                thumbnail_url="thumbnails/L1.png"
            )
            db.add(course)
            db.commit()
            db.refresh(course)
            print(f"Created Course: {course.title}")

        # Seed Units
        for unit_data in units_data:
            unit = Unit(
                course_id=course.id,
                title=unit_data["title"],
                order_index=unit_data["order_index"]
            )
            db.add(unit)
            db.commit()
            db.refresh(unit)
            print(f"  + Unit {unit.order_index}: {unit.title}")
            
            # Seed Lessons
            for i, lesson_data in enumerate(unit_data["lessons"]):
                lesson = Lesson(
                    unit_id=unit.id,
                    title=lesson_data["title"],
                    lesson_type=LessonType.VOCABULARY,
                    order_index=i + 1,
                    thumbnail_url=f"https://placehold.co/600x400?text={lesson_data['title'].replace(' ', '+')}",
                    video_url="https://www.w3schools.com/html/mov_bbb.mp4",
                    pronunciation_word=lesson_data.get("pronunciation_target"),
                    vocabulary=lesson_data.get("vocabulary")
                )
                db.add(lesson)
                db.commit()
                db.refresh(lesson)
                
                # Seed Questions
                if "questions" in lesson_data:
                    for idx, q_data in enumerate(lesson_data["questions"]):
                        question = Question(
                            lesson_id=lesson.id,
                            text=q_data["text"],
                            options=q_data["options"],
                            correct_answer=q_data["correct_answer"],
                            order_index=idx
                        )
                        db.add(question)
                    db.commit()
    except Exception as e:
        print(f"Error seeding curriculum: {e}")
        import traceback
        traceback.print_exc()


# ... (start of seed_shop)
def seed_shop(db):
    print("\n--- [3/3] Seeding Shop ---")
    items_data = load_json_fixture("shop_items.json")
    
    try:
        for item_data in items_data:
            # Convert string category to Enum
            if "category" in item_data:
                item_data["category"] = ItemCategory(item_data["category"])
                
            item = ShopItem(**item_data)
            db.add(item)
            print(f"Created Item: {item_data['name']}")
        db.commit()
    except Exception as e:
        print(f"Error seeding shop: {e}")

def seed_vocabulary(db):
    print("\n--- [4/4] Seeding Vocabulary ---")
    words_data = load_json_fixture("vocabularies.json")
    
    try:
        # Seed Words
        created_count = 0
        for item in words_data:
            existing = db.query(Vocabulary).filter(Vocabulary.word == item['word']).first()
            if not existing:
                new_word = Vocabulary(
                    word=item['word'],
                    meaning=item['meaning'],
                    pronunciation=item.get('pronunciation'),
                    example_sentence=item.get('example_sentence'),
                    image_url=item.get('image_url'),
                    audio_url=item.get('audio_url')
                )
                db.add(new_word)
                created_count += 1
        db.commit()
        print(f"Seeded {created_count} vocabulary words.")
        
        # Seed Progress for Admin (ID 1) AND Student
        users = db.query(User).filter(User.role.in_([UserRole.ADMIN, UserRole.STUDENT])).all()
        for user in users:
            if user:
                print(f"Seeding progress for user: {user.email}")
                vocab_list = db.query(Vocabulary).all()
                for i, word in enumerate(vocab_list):
                    prog = db.query(UserWordProgress).filter(
                        UserWordProgress.user_id == user.id,
                        UserWordProgress.word_id == word.id
                    ).first()
                    
                    if not prog:
                        # Make first 5 overdue
                        if i < 5:
                            next_review = datetime.utcnow() - timedelta(hours=1)
                            level = 1
                        else:
                            next_review = datetime.utcnow() - timedelta(days=1) # Also overdue/ready
                            level = 1
                        
                        new_prog = UserWordProgress(
                            user_id=user.id,
                            word_id=word.id,
                            box_level=level,
                            next_review_at=next_review,
                            last_reviewed_at=datetime.utcnow() - timedelta(days=2)
                        )
                        db.add(new_prog)
                
                db.commit()
                print(f"Seeded progress records for {user.email}.")
            
    except Exception as e:
        print(f"Error seeding vocabulary: {e}")

def seed_gem_packs(db):
    """Seed available gem packs for purchase"""
    print("\n--- Seeding Gem Packs ---")
    
    gem_packs_data = [
        {
            "name": "Gói 1000 Gem",
            "description": "Bắt đầu nhỏ",
            "gem_amount": 1000,
            "price_vnd": 50000,
            "bonus_gem_percent": 0,
            "order_index": 1
        },
        {
            "name": "Gói 5000 Gem",
            "description": "Tiết kiệm hơn",
            "gem_amount": 5000,
            "price_vnd": 200000,
            "bonus_gem_percent": 5,
            "order_index": 2
        },
        {
            "name": "Gói 10000 Gem",
            "description": "Rất tiết kiệm",
            "gem_amount": 10000,
            "price_vnd": 350000,
            "bonus_gem_percent": 10,
            "order_index": 3
        },
        {
            "name": "Gói 25000 Gem",
            "description": "Siêu tiết kiệm",
            "gem_amount": 25000,
            "price_vnd": 800000,
            "bonus_gem_percent": 15,
            "order_index": 4
        },
        {
            "name": "Gói 50000 Gem",
            "description": "Gói VIP",
            "gem_amount": 50000,
            "price_vnd": 1400000,
            "bonus_gem_percent": 20,
            "order_index": 5
        }
    ]
    
    try:
        for pack_data in gem_packs_data:
            existing = db.query(GemPack).filter(GemPack.name == pack_data["name"]).first()
            if not existing:
                gem_pack = GemPack(**pack_data, is_active=True)
                db.add(gem_pack)
                print(f"Created: {pack_data['name']} - {pack_data['gem_amount']} gems - {pack_data['price_vnd']} VND")
        
        db.commit()
    except Exception as e:
        print(f"Error seeding gem packs: {e}")

def seed_all():
    print("🚀 Starting Complete 'Boom' Seeding 🚀")
    
    # 1. Init & Reset DB
    init_db()
    print("WARNING: Dropping all tables for fresh seed...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        seed_users(db)
        seed_curriculum(db)
        seed_shop(db)
        seed_gem_packs(db)
        seed_vocabulary(db)
        print("\n✅ All seeding completed successfully! ✅")
    except Exception as e:
        print(f"\n❌ Seeding failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_all()
