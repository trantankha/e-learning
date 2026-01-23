from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class GemPackBase(BaseModel):
    name: str
    description: Optional[str] = None
    gem_amount: int
    price_vnd: float
    bonus_gem_percent: float = 0.0
    is_active: bool = True
    order_index: int = 0


class GemPackCreate(GemPackBase):
    pass


class GemPack(GemPackBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GemPackResponse(BaseModel):
    """Simplified response for frontend"""
    id: int
    name: str
    description: Optional[str] = None
    gem_amount: int
    bonus_gem_percent: float = 0.0
    total_gems: int  # gem_amount + bonus
    price_vnd: float
    is_active: bool = True
    order_index: int = 0

    class Config:
        from_attributes = True

    @staticmethod
    def from_model(pack) -> "GemPackResponse":
        """Convert GemPack model to response"""
        return GemPackResponse(
            id=pack.id,
            name=pack.name,
            description=pack.description,
            gem_amount=pack.gem_amount,
            bonus_gem_percent=pack.bonus_gem_percent,
            total_gems=pack.get_total_gems(),
            price_vnd=pack.price_vnd,
            is_active=pack.is_active,
            order_index=pack.order_index
        )


class CreateGemOrderRequest(BaseModel):
    """Request để tạo đơn hàng mua Gem"""
    gem_pack_id: int
    coupon_code: Optional[str] = None


class GemOrderResponse(BaseModel):
    """Response cho đơn hàng mua Gem"""
    order_id: str
    gem_pack_id: int
    gem_amount: int
    total_gems: int  # Tính cả bonus
    original_price: float
    discount_amount: float = 0.0
    final_amount: float
    status: str
    qr_url: str
    coupon_code: Optional[str] = None

    class Config:
        from_attributes = True
