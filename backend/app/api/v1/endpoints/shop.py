from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api import deps
from app.models.shop import ShopItem, Inventory
from app.models.user import User, StudentProfile
from app.schemas import shop as shop_schemas

router = APIRouter()

@router.get("/items", response_model=List[shop_schemas.ShopItem])
def read_shop_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    # Get student profile
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    items = db.query(ShopItem).all()
    
    # Get user inventory to map is_owned and is_equipped
    inventory_map = {
        inv.item_id: inv 
        for inv in db.query(Inventory).filter(Inventory.student_id == student.id).all()
    }
    
    result = []
    for item in items:
        # Pydantic model creation
        # Using construct or manual mapping since ShopItem Pydantic uses 'category' enum
        # DB item has 'category', Pydantic has 'category'. Compatible.
        
        owned_inv = inventory_map.get(item.id)
        
        item_data = shop_schemas.ShopItem(
            id=item.id,
            name=item.name,
            description=item.description,
            price=item.price,
            category=item.category,
            layer_order=item.layer_order,
            image_url=item.image_url,
            is_owned=bool(owned_inv),
            is_equipped=bool(owned_inv and owned_inv.is_equipped)
        )
        result.append(item_data)
        
    return result

@router.post("/buy", response_model=shop_schemas.BuyItemResponse)
def buy_item(
    data: shop_schemas.BuyItemRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    item = db.query(ShopItem).filter(ShopItem.id == data.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Check ownership
    existing = db.query(Inventory).filter(
        Inventory.student_id == student.id,
        Inventory.item_id == item.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="You already own this item")

    # Check balance
    if student.total_gems < item.price:
        raise HTTPException(status_code=400, detail="Not enough gems")

    # Transaction
    try:
        student.total_gems -= item.price
        # is_equipped defaults to False
        new_inv = Inventory(student_id=student.id, item_id=item.id)
        db.add(new_inv)
        db.add(student)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Transaction failed: {str(e)}")

    return shop_schemas.BuyItemResponse(
        message="Purchase successful!",
        remaining_gems=student.total_gems,
        item_name=item.name
    )

@router.post("/equip/{item_id}", response_model=shop_schemas.EquipItemResponse)
def equip_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Equip an item. Automatically unequip other items in the same category.
    """
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # 1. Get the target item and verify ownership
    target_inv = db.query(Inventory).filter(
        Inventory.student_id == student.id,
        Inventory.item_id == item_id
    ).first()
    
    if not target_inv:
        raise HTTPException(status_code=404, detail="Item not found in your inventory")

    # 2. Get the item details to know its category
    target_item = db.query(ShopItem).filter(ShopItem.id == item_id).first()
    category = target_item.category
    
    # 3. Find currently equipped item in this category (if any)
    # We join Inventory -> ShopItem to filter by category
    current_equipped = db.query(Inventory).join(ShopItem).filter(
        Inventory.student_id == student.id,
        Inventory.is_equipped == True,
        ShopItem.category == category
    ).first()
    
    unequipped_id = None
    
    try:
        # If something else is equipped, unequip it
        if current_equipped and current_equipped.id != target_inv.id:
            current_equipped.is_equipped = False
            unequipped_id = current_equipped.item_id
            db.add(current_equipped)
            
        # Equip the new item
        # If we clicked the same item that is already equipped, maybe we want to unequip it (toggle)?
        # Requirement says "Mặc đồ mới", implies setting True. 
        # But if user wants to take off a hat? Usually frontend handles "Equip/Unequip" toggle.
        # Let's assume this endpoint is strictly for EQUIPPING.
        
        target_inv.is_equipped = True
        db.add(target_inv)
        
        db.commit()
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to equip item")
        
    return shop_schemas.EquipItemResponse(
        message=f"Equipped {target_item.name}",
        equipped_item_id=target_item.id,
        unequipped_item_id=unequipped_id,
        category=category
    )
