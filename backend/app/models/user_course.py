from sqlalchemy import Column, Integer, ForeignKey, DateTime, Boolean, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class UserCourse(Base):
    """
    Model để quản lý khóa học của user.
    Khi user mua khóa học thành công, record mới được thêm vào bảng này.
    """
    __tablename__ = 'user_courses'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey('courses.id'), nullable=False, index=True)
    
    # Metadata
    purchased_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    activated_at = Column(DateTime, nullable=True)  # Khi user kích hoạt khóa học
    is_active = Column(Boolean, default=True, index=True)
    
    # Liên kết tới Order
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=True)
    
    # Các trường tùy chọn
    access_expires_at = Column(DateTime, nullable=True)  # Nếu khóa học có hạn
    notes = Column(String, nullable=True)  # Ghi chú (ví dụ: lý do kích hoạt)

    def __str__(self):
        return f"User {self.user_id} - Course {self.course_id}"
