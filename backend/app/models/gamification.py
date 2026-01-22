from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from .enums import ItemType, CurrencyType

class Item(Base):
    __tablename__ = 'items'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    item_type = Column(Enum(ItemType), nullable=False)
    price_stars = Column(Integer, default=0)
    image_url = Column(String, nullable=True)

    owners = relationship("UserItem", back_populates="item")

class UserItem(Base):
    __tablename__ = 'user_items'

    student_id = Column(Integer, ForeignKey('student_profiles.id'), primary_key=True)
    item_id = Column(Integer, ForeignKey('items.id'), primary_key=True)
    
    is_equipped = Column(Boolean, default=False)
    obtained_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="inventory")
    item = relationship("Item", back_populates="owners")

class PointLog(Base):
    __tablename__ = 'point_logs'

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('student_profiles.id'), nullable=False)
    
    change_amount = Column(Integer, nullable=False)
    currency_type = Column(Enum(CurrencyType), default=CurrencyType.STAR)
    reason = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="point_logs")
