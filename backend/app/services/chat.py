import logging
from typing import Generator, List
from sqlalchemy.orm import Session
from google import genai
from google.genai import types
from app.core.config import settings
from app.models.chat import ChatHistory, ChatRole

logger = logging.getLogger(__name__)

class GeminiChatService:
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        if not self.api_key:
            logger.warning("GOOGLE_API_KEY is not set. Gemini features will fail.")
            self.client = None
        else:
            self.client = genai.Client(api_key=self.api_key)
            
        self.model_name = "gemini-2.5-flash"
        
        # Chi tiết system instruction
        self.system_instruction = """Bạn là Thỏ Rocket 🐰, giáo viên tiếng Anh chuyên dạy trẻ em (4-12 tuổi).

**Tính cách:**
- Vui vẻ, thân thiện, luôn khích lệ học sinh
- Dùng emoji phù hợp (không quá 2-3 emoji/tin)
- Nói chuyện ngắn gọn, dễ hiểu cho trẻ em

**Quy tắc dạy học:**
1. Luôn sửa lỗi ngữ pháp/phát âm một cách nhẹ nhàng, tự nhiên
2. Giải thích từ vựng mới bằng tiếng Việt khi cần thiết
3. Dùng ví dụ thực tế, gần gũi với đời sống trẻ em
4. Luôn khích lệ, tôn vinh nỗ lực của học sinh
5. Tránh bài học dài dòng, giữ mỗi tin < 200 từ
6. Đặt câu hỏi để trẻ tiếp tục tham gia

**Format phản hồi:**
- Bắt đầu: Câu hỏi hoặc nhận xét vui vẻ
- Nội dung: Giải thích ngắn (1-2 câu)
- Ví dụ: 1-2 ví dụ đơn giản nếu cần
- Kết thúc: Khích lệ + câu hỏi lôi cuốn tiếp theo

**Cấm:**
- Dùng từ quá khó, câu quá phức tạp
- Tạo bài tập dài, nhàm chán
- Nói kém lạc quan hoặc tiêu cực
"""

    def get_conversation_history(self, user_id: int, db: Session, limit: int = 10) -> List[types.Content]:
        """
        Lấy lịch sử hội thoại gần đây từ database để tạo context.
        """
        try:
            # Lấy 'limit' tin nhắn gần đây nhất
            history_records = db.query(ChatHistory).filter(
                ChatHistory.user_id == user_id
            ).order_by(ChatHistory.created_at.desc()).limit(limit).all()
            
            # Đảo ngược để thứ tự đúng (cũ nhất -> mới nhất)
            history_records.reverse()
            
            # Chuyển thành format Gemini
            contents = []
            for record in history_records:
                contents.append(
                    types.Content(
                        role=record.role,
                        parts=[types.Part(text=record.content)]
                    )
                )
            return contents
        except Exception as e:
            logger.error(f"Error retrieving chat history: {e}")
            return []

    def save_chat_message(self, user_id: int, role: str, content: str, db: Session) -> None:
        """
        Lưu tin nhắn vào database để giữ lịch sử.
        """
        try:
            message = ChatHistory(
                user_id=user_id,
                role=role,
                content=content
            )
            db.add(message)
            db.commit()
        except Exception as e:
            logger.error(f"Error saving chat message: {e}")
            db.rollback()

    def generate_chat_stream(self, message: str, user_id: int = 1, db: Session = None) -> Generator[bytes, None, None]:
        """
        Generate streaming response from Gemini with conversation history.
        Yields plain text bytes only - no JSON wrapping, no metadata.
        """
        if not self.client:
            yield b"Error: GOOGLE_API_KEY is not configured on the server."
            return

        try:
            # Lấy lịch sử cuộc hội thoại (nếu có database connection)
            history_contents = []
            if db:
                history_contents = self.get_conversation_history(user_id, db, limit=10)
            
            # Tạo contents list: history + message hiện tại
            contents = history_contents.copy()
            contents.append(
                types.Content(
                    role="user",
                    parts=[types.Part(text=message)]
                )
            )

            # Stream from Gemini
            response_stream = self.client.models.generate_content_stream(
                model=self.model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=self.system_instruction,
                    temperature=0.7,
                )
            )
            
            # Tích lũy response để lưu sau
            full_response = ""
            
            # Yield only the text content, encoded as bytes
            for chunk in response_stream:
                if chunk.text:
                    full_response += chunk.text
                    yield chunk.text.encode('utf-8')
            
            # Lưu message vào history
            if db and full_response:
                self.save_chat_message(user_id, ChatRole.USER.value, message, db)
                self.save_chat_message(user_id, ChatRole.MODEL.value, full_response, db)

        except Exception as e:
            logger.error(f"Error during Gemini stream: {e}")
            yield f"Error: {str(e)}".encode('utf-8')


# Global instance of chat service
chat_service = GeminiChatService()
