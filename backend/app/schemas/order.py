from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrderCreate(BaseModel):
    amount: float
    description: Optional[str] = None
    item_type: Optional[str] = None
    item_id: Optional[str] = None
    coupon_code: Optional[str] = None

class OrderResponse(BaseModel):
    order_id: str
    amount: float
    description: Optional[str] = None
    status: str
    qr_url: str
    discount_amount: float = 0.0
    coupon_code: Optional[str] = None


class WebhookPayload(BaseModel):
    # This structure depends on the provider (Casso, Sepay)
    # We will simulate a generic structure or one compatible with typical providers
    # Usually they send content like "content": "DH123456 ..."
    content: str
    amount: float
    # ... other fields
