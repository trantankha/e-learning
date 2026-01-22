from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.enums import ItemCategory

class ShopItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: int
    category: ItemCategory
    layer_order: int = 0
    image_url: Optional[str] = None

class ShopItem(ShopItemBase):
    id: int
    is_owned: bool = False # Helper for frontend
    is_equipped: bool = False # Helper for frontend

    class Config:
        from_attributes = True

class BuyItemRequest(BaseModel):
    item_id: int

class BuyItemResponse(BaseModel):
    message: str
    remaining_gems: int
    item_name: str
    
class EquipItemResponse(BaseModel):
    message: str
    equipped_item_id: int
    unequipped_item_id: Optional[int]
    category: ItemCategory
