from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from .enums import ItemCategory

class ShopItem(Base):
    __tablename__ = 'shop_items'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Integer, nullable=False) # Price in Gems
    image_url = Column(String, nullable=True)
    
    # New fields
    category = Column(Enum(ItemCategory), nullable=False)
    layer_order = Column(Integer, default=0) # 0=Background, 1=Body, 2=Shirt, 3=Glasses, 4=Hat
    
    inventory_items = relationship("Inventory", back_populates="item")

class Inventory(Base):
    __tablename__ = 'inventory'

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('student_profiles.id'), nullable=False)
    item_id = Column(Integer, ForeignKey('shop_items.id'), nullable=False)
    acquired_at = Column(DateTime, default=datetime.utcnow)
    is_equipped = Column(Boolean, default=False)
    
    student_profile = relationship("StudentProfile", back_populates="shop_inventory")
    item = relationship("ShopItem", back_populates="inventory_items")
