from pydantic import BaseModel
from typing import Optional, Dict, Any
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


# ============ SePay/Casso VietQR Webhook Schemas ============

class SePayWebhookData(BaseModel):
    """
    Schema cho webhook từ SePay/Casso.
    
    Ví dụ data từ SePay:
    {
        "id": "abc123",
        "gateway": "SePay",
        "transactionDate": "2024-01-22 10:30:45",
        "accountNumber": "1234567890",
        "subAccount": null,
        "transferAmount": 500000,
        "transferContent": "DH12345",
        "referenceCode": "ref123",
        "transactionType": "IN",
        "description": "VCB-0021234567890-240122-103045"
    }
    """
    id: str
    gateway: str  # "SePay", "Casso", etc.
    transactionDate: str
    accountNumber: str
    subAccount: Optional[str] = None
    transferAmount: float
    transferContent: str  # Nội dung chuyển khoản (chứa ORDER_ID)
    referenceCode: str
    transactionType: Optional[str] = None
    description: Optional[str] = None
    
    class Config:
        # Allow extra fields từ SePay
        extra = "allow"


class SePayWebhookRequest(BaseModel):
    """
    Request body từ SePay webhook.
    """
    data: SePayWebhookData
    
    class Config:
        extra = "allow"


class SePayWebhookResponse(BaseModel):
    """
    Response cho SePay webhook.
    """
    success: bool
    message: Optional[str] = None
    order_id: Optional[str] = None
    error_code: Optional[str] = None
