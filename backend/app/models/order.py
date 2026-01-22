from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from .enums import OrderStatus

class Order(Base):
    __tablename__ = 'orders'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    order_id = Column(String, unique=True, index=True, nullable=False) # e.g., "DH123456"
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Store what was bought (optional, simple JSON or just type)
    # For now assume mostly Gems or generic
    item_type = Column(String, nullable=True) # e.g. "gem_pack", "course"
    item_id = Column(String, nullable=True)   # e.g. "pack_1"
    
    coupon_code = Column(String, nullable=True)
    discount_amount = Column(Float, default=0.0)

    user = relationship("User", back_populates="orders")

    def __str__(self):
        return f"Order {self.order_id} - {self.amount} ({self.status.value})"
