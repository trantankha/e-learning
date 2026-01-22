from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.enums import DiscountType

class CouponBase(BaseModel):
    code: str
    discount_type: DiscountType
    discount_value: int
    max_usage: int
    expiry_date: datetime
    is_active: bool = True

class CouponCreate(CouponBase):
    pass

class Coupon(CouponBase):
    id: int
    usage_count: int

    class Config:
        from_attributes = True

class CouponValidateRequest(BaseModel):
    coupon_code: str
    original_amount: float

class CouponValidateResponse(BaseModel):
    valid: bool
    discount_amount: float
    final_amount: float
    message: Optional[str] = None
