from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from typing import Any
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api import deps
from app.services.chat import chat_service

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    user_id: int = 1  # Default user_id, có thể từ auth token

@router.post("")
async def chat(
    request: ChatRequest,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Stream chat response from Gemini chatbot with conversation history.
    
    Usage: POST /api/v1/chat with {"message": "your message", "user_id": 1}
    """
    return StreamingResponse(
        chat_service.generate_chat_stream(request.message, request.user_id, db),
        media_type="text/plain; charset=utf-8"
    )

