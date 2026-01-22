from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ChatMessageCreate(BaseModel):
    message: str
    user_id: int # Optionally passed if not using auth dependency directly, but ideally inferred. Keeping as requested.

class ChatHistoryResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    response: str
