from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.api import deps
from app.core.database import get_db
from app.models.order import Order, OrderStatus
from app.models.coupon import Coupon
from app.models.enums import DiscountType
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse, WebhookPayload
from app.schemas.coupon import CouponValidateRequest, CouponValidateResponse
from datetime import datetime
from app.services.storage import minio_handler
from app.services.email_service import email_service
from app.services.tasks import send_payment_success_email_task
import uuid
from app.core.config import settings
from fastapi import BackgroundTasks

router = APIRouter()

def validate_coupon_logic(db: Session, code: str):
    coupon = db.query(Coupon).filter(Coupon.code == code).first()
    if not coupon:
        return None, "Mã giảm giá không tồn tại."
    if not coupon.is_active:
        return None, "Mã giảm giá không hoạt động."
    if coupon.expiry_date < datetime.utcnow():
        return None, "Mã giảm giá đã hết hạn."
    if coupon.usage_count >= coupon.max_usage:
        return None, "Mã giảm giá đã hết lượt sử dụng."
    return coupon, None

@router.post("/orders/validate-coupon", response_model=CouponValidateResponse)
def validate_coupon(
    item: CouponValidateRequest,
    db: Session = Depends(get_db)
):
    coupon, error = validate_coupon_logic(db, item.coupon_code)
    if error:
        return CouponValidateResponse(
            valid=False,
            discount_amount=0,
            final_amount=item.original_amount,
            message=error
        )
    
    # Calculate discount
    discount = 0.0
    if coupon.discount_type == DiscountType.PERCENT:
        discount = item.original_amount * (coupon.discount_value / 100.0)
    elif coupon.discount_type == DiscountType.FIXED_AMOUNT:
        discount = float(coupon.discount_value)
        
    if discount > item.original_amount:
        discount = item.original_amount
        
    final = item.original_amount - discount
    
    return CouponValidateResponse(
        valid=True,
        discount_amount=discount,
        final_amount=final,
        message="Áp dụng mã giảm giá thành công."
    )


@router.post("/orders", response_model=OrderResponse)
def create_order(
    item: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # 0. Handle Coupon if present
    final_amount = item.amount
    discount_val = 0.0
    
    if item.coupon_code:
        coupon, error = validate_coupon_logic(db, item.coupon_code)
        if error:
             raise HTTPException(status_code=400, detail=error)
             
        # Calculate discount
        if coupon.discount_type == DiscountType.PERCENT:
            discount_val = item.amount * (coupon.discount_value / 100.0)
        elif coupon.discount_type == DiscountType.FIXED_AMOUNT:
            discount_val = float(coupon.discount_value)
            
        if discount_val > item.amount:
            discount_val = item.amount
            
        final_amount = item.amount - discount_val
    
    # 1. Create Order ID
    order_id = f"DH{int(uuid.uuid4().int % 1000000)}" # Simple unique ID: DH123456
    
    # 2. Save to DB
    new_order = Order(
        user_id=current_user.id,
        order_id=order_id,
        amount=final_amount,
        description=item.description or f"Payment for {item.item_type}",
        item_type=item.item_type,
        item_id=item.item_id,
        status=OrderStatus.PENDING,
        coupon_code=item.coupon_code,
        discount_amount=discount_val
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # 3. Generate VietQR URL
    # Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>&accountName=<NAME>
    # addInfo must match the order_id for tracking
    qr_url = f"https://img.vietqr.io/image/{settings.BANK_ID}-{settings.ACCOUNT_NO}-compact.png?amount={int(final_amount)}&addInfo={order_id}&accountName={settings.ACCOUNT_NAME}"
    
    return OrderResponse(
        order_id=order_id,
        amount=new_order.amount,
        description=new_order.description,
        status=new_order.status.value,
        qr_url=qr_url,
        discount_amount=new_order.discount_amount,
        coupon_code=new_order.coupon_code
    )

@router.post("/webhook/payment-confirm")
async def payment_webhook(
    payload: dict, # Accept generic dict to be flexible with providers
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Parsing logic (Simulated for Casso/Sepay)
    # They usually send a list of transactions or a single transaction
    # Let's assume payload has 'content' field which contains our Order ID
    
    print(f"Received Webhook: {payload}")
    
    content = payload.get("content", "") # Message from bank transaction
    amount = payload.get("amount", 0)
    
    # Find Order ID in content
    # e.g. "DH123456 chuyen tien" -> find "DH123456"
    # Simple search
    
    # Verify secure token if needed (omitted for now)
    
    # Find pending order
    # We query all pending orders and check if their ID is in the content
    # Optimized: If we extract the ID first.
    # Let's assume we extract "DH..." using regex or just simple check if testing
    
    # For simplicity/demo: check if known order_id is in content
    # In production, use Regex to extract ID
    
    # Strategy: Find the order by iterating pending orders? No, too slow.
    # Better: Extract candidate ID.
    import re
    match = re.search(r"(DH\d+)", content)
    if not match:
        return {"status": "ignored", "reason": "No order ID found"}
        
    order_id = match.group(1)
    
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        return {"status": "error", "reason": "Order not found"}
        
    if order.status == OrderStatus.PAID:
        return {"status": "ok", "reason": "Already paid"}
        
    # Check amount match (approximate since sometimes fees apply?)
    if float(amount) < order.amount:
         return {"status": "error", "reason": "Insufficient amount"}
         
    # Update Status
    order.status = OrderStatus.PAID
    
    # --- COUPON LOGIC START ---
    if order.coupon_code:
        coupon = db.query(Coupon).filter(Coupon.code == order.coupon_code).first()
        if coupon:
            # Check if usage limit exceeded (Advanced check)
            if coupon.usage_count >= coupon.max_usage:
                print(f"[WARNING] Order {order_id} used coupon {coupon.code} but it exceeded max_usage ({coupon.usage_count}/{coupon.max_usage}). Admin check required.")
                # We still accept the order as it is already paid.
            
            coupon.usage_count += 1
            db.add(coupon)
    # --- COUPON LOGIC END ---
            
    db.commit()
    
    # Trigger Rewards (Gems)
    # If item_type == 'gem_pack_100', add 100 gems
    if order.item_type == 'gem_pack':
        # Check student profile
        if order.user.student_profile:
             # Logic to calculate gems from amount? 
             # Or use item_id mapping. 
             # Let's assume 1000 VND = 1 Gem
             gems_to_add = int(order.amount / 1000)
             order.user.student_profile.total_gems += gems_to_add
             db.commit()
             print(f"Added {gems_to_add} gems to user {order.user.email}")
             
    # Send Payment Success Email
    try:
        if settings.MAIL_USERNAME and "your-email" not in settings.MAIL_USERNAME:
            order_info = {
                "order_id": order.order_id,
                "description": order.description,
                "amount": order.amount,
                "date": datetime.utcnow().strftime("%d/%m/%Y %H:%M")
            }
            # background_tasks.add_task(
            #     email_service.send_payment_success_email, 
            #     order.user.email, 
            #     order.user.full_name, 
            #     order_info
            # )
            send_payment_success_email_task.delay(
                order.user.email, 
                order.user.full_name, 
                order_info
            )
    except Exception as e:
        print(f"Failed to send email: {e}")
    
    return {"status": "success", "order_id": order_id}

@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Check permission (only owner or admin)
    if order.user_id != current_user.id and current_user.role != "admin":
         raise HTTPException(status_code=403, detail="Not authorized")
         
    qr_url = f"https://img.vietqr.io/image/{settings.BANK_ID}-{settings.ACCOUNT_NO}-compact.png?amount={int(order.amount)}&addInfo={order.order_id}&accountName={settings.ACCOUNT_NAME}"
    
    return OrderResponse(
        order_id=order.order_id,
        amount=order.amount,
        description=order.description,
        status=order.status.value,
        qr_url=qr_url, 
        discount_amount=order.discount_amount,
        coupon_code=order.coupon_code
    )
