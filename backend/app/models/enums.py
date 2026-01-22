import enum

class UserRole(enum.Enum):
    ADMIN = "admin"
    PARENT = "parent"
    STUDENT = "student"

class CourseLevel(enum.Enum):
    STARTERS = "starters"
    MOVERS = "movers"
    FLYERS = "flyers"

class LessonType(enum.Enum):
    VOCABULARY = "vocabulary"
    GRAMMAR = "grammar"
    PHONICS = "phonics"
    LISTENING = "listening"
    QUIZ = "quiz"

class ItemType(enum.Enum):
    AVATAR = "avatar"
    BADGE = "badge"
    THEME = "theme"

class CurrencyType(enum.Enum):
    STAR = "star"
    GEM = "gem"

class ItemCategory(enum.Enum):
    HAT = "hat"
    SHIRT = "shirt"
    GLASSES = "glasses"
    BACKGROUND = "background"
    BODY = "body"

class OrderStatus(enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    CANCELLED = "cancelled"

class DiscountType(enum.Enum):
    PERCENT = "percent"
    FIXED_AMOUNT = "fixed_amount"
