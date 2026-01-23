from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from app.core.database import Base


class GemPack(Base):
    __tablename__ = 'gem_packs'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # e.g. "Gói 1000 Gem"
    description = Column(String, nullable=True)  # e.g. "Gói tiết kiệm"
    gem_amount = Column(Integer, nullable=False)  # Số gem trong gói (1000, 5000, etc.)
    price_vnd = Column(Float, nullable=False)  # Giá bán (VND)
    
    # Bonus fields (optional)
    bonus_gem_percent = Column(Float, default=0.0)  # % Gem thưởng (e.g. 10% bonus)
    
    # Status
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)  # Sắp xếp hiển thị
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __str__(self):
        return f"{self.name} - {self.gem_amount} gems - {self.price_vnd} VND"

    def get_total_gems(self) -> int:
        """Tính tổng gem sau khi tính bonus"""
        bonus = int(self.gem_amount * (self.bonus_gem_percent / 100))
        return self.gem_amount + bonus
