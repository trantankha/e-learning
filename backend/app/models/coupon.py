from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Float
from app.core.database import Base
from .enums import DiscountType
from datetime import datetime

class Coupon(Base):
    __tablename__ = 'coupons'

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    discount_type = Column(Enum(DiscountType), nullable=False)
    discount_value = Column(Integer, nullable=False) # stored as integer (e.g., 50 for 50% or 50000)
    max_usage = Column(Integer, default=1)
    usage_count = Column(Integer, default=0)
    expiry_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
