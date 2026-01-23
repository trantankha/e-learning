from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.api import deps
from app.core.database import get_db
from app.models.order import Order, OrderStatus
from app.models.coupon import Coupon
from app.models.enums import DiscountType
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse, WebhookPayload, SePayWebhookRequest, SePayWebhookResponse
from app.schemas.coupon import CouponValidateRequest, CouponValidateResponse
from datetime import datetime
from app.services.storage import minio_handler
from app.services.email_service import email_service
from app.services.tasks import send_payment_success_email_task
from app.services.payment_service import PaymentService
from app.models.gem_pack import GemPack
from app.schemas.gem_pack import GemPackResponse, CreateGemOrderRequest, GemOrderResponse
import uuid
from app.core.config import settings
from fastapi import BackgroundTasks
import re
import logging
from sqlalchemy import and_
from typing import List

logger = logging.getLogger(__name__)

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


@router.get("/gem-packs", response_model=List[GemPackResponse])
def list_gem_packs(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Lấy danh sách các gói gem có sẵn để mua
    """
    packs = db.query(GemPack).filter(GemPack.is_active == True).order_by(GemPack.order_index).all()
    
    return [GemPackResponse.from_model(pack) for pack in packs]


@router.post("/gem-orders", response_model=GemOrderResponse)
def create_gem_order(
    item: CreateGemOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Tạo đơn hàng mua Gem
    
    - Kiểm tra gói gem tồn tại và hoạt động
    - Áp dụng mã giảm giá nếu có
    - Tạo đơn hàng và generate VietQR code
    """
    try:
        order, response = PaymentService.create_gem_order(
            db=db,
            user=current_user,
            gem_pack_id=item.gem_pack_id,
            coupon_code=item.coupon_code
        )
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating gem order: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Lỗi tạo đơn hàng")


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

# =====================================================================
#                      SEPAY/CASSO VIETQR WEBHOOK
# =====================================================================

def extract_order_id_from_content(content: str) -> str:
    """
    Trích xuất ORDER_ID từ nội dung chuyển khoản.
    
    Ví dụ:
    - "DH12345" -> "DH12345"
    - "DH 12345 thanh toán khóa học" -> "DH12345"
    - "12345" -> "12345"
    
    Args:
        content: Nội dung chuyển khoản từ SePay
    
    Returns:
        ORDER_ID nếu tìm thấy, "" nếu không
    """
    if not content:
        return ""
    
    # Loại bỏ khoảng trắng trong content để dễ tìm
    content_clean = content.replace(" ", "")
    
    # Tìm pattern "DH<số>" hoặc chỉ "<số>"
    match = re.search(r"(DH\d+|\d{4,10})", content_clean)
    
    if match:
        order_id = match.group(1)
        return order_id
    
    return ""


def verify_sepay_token(authorization_header: str) -> bool:
    """
    Xác thực token từ header Authorization.
    
    SePay thường gửi: "Authorization: Bearer {SEPAY_API_KEY}"
    hoặc: "Authorization: {SEPAY_WEBHOOK_SECRET}"
    
    Args:
        authorization_header: Giá trị từ header Authorization
    
    Returns:
        True nếu token hợp lệ
    """
    if not authorization_header:
        return False
    
    # Hỗ trợ cả 2 format: "Bearer <token>" và "<token>"
    if authorization_header.startswith("Bearer "):
        token = authorization_header.replace("Bearer ", "")
    else:
        token = authorization_header
    
    # So sánh với secret key
    return token == settings.SEPAY_WEBHOOK_SECRET or token == settings.SEPAY_API_KEY


def check_amount_tolerance(transferred: float, expected: float, tolerance: float = None) -> bool:
    """
    Kiểm tra xem số tiền chuyển khoản có khớp với đơn hàng không.
    Chấp nhận sai số nhỏ (vì phí ngân hàng có thể trừ).
    
    Args:
        transferred: Số tiền thực tế chuyển
        expected: Số tiền kỳ vọng từ đơn hàng
        tolerance: Sai số cho phép (VND). Mặc định từ config
    
    Returns:
        True nếu số tiền hợp lệ
    """
    if tolerance is None:
        tolerance = settings.PAYMENT_TOLERANCE_AMOUNT
    
    # Số tiền chuyển phải >= số tiền kỳ vọng - tolerance
    # Và <= số tiền kỳ vọng + tolerance
    return (expected - tolerance) <= transferred <= (expected + tolerance)


@router.post("/webhook/sepay", response_model=SePayWebhookResponse)
async def sepay_payment_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Webhook để xử lý thanh toán từ SePay/Casso.
    
    **Flow xử lý:**
    1. Kiểm tra xác thực (Authorization header)
    2. Trích xuất ORDER_ID từ nội dung chuyển khoản
    3. Tìm đơn hàng trong database
    4. Kiểm tra số tiền khớp với tolerance
    5. Update trạng thái ORDER → PAID
    6. Kích hoạt khóa học cho user (nếu item_type=course)
    7. Gửi email xác nhận qua Celery task
    
    **Request Header:**
    ```
    Authorization: Bearer {SEPAY_WEBHOOK_SECRET}
    ```
    
    **Request Body (SePay format):**
    ```json
    {
        "data": {
            "id": "abc123",
            "gateway": "SePay",
            "transactionDate": "2024-01-22 10:30:45",
            "accountNumber": "1234567890",
            "transferAmount": 500000,
            "transferContent": "DH12345",
            "referenceCode": "ref123"
        }
    }
    ```
    
    **Response:**
    ```json
    {
        "success": true,
        "message": "Payment processed successfully",
        "order_id": "DH12345"
    }
    ```
    """
    
    # ===== STEP 1: SECURITY CHECK =====
    auth_header = request.headers.get("Authorization", "")
    
    if not verify_sepay_token(auth_header):
        logger.warning(f"Unauthorized webhook attempt. Header: {auth_header}")
        return SePayWebhookResponse(
            success=False,
            message="Unauthorized",
            error_code="UNAUTHORIZED"
        )
    
    # ===== STEP 2: PARSE REQUEST BODY =====
    try:
        webhook_data = await request.json()
        webhook_request = SePayWebhookRequest(**webhook_data)
        transaction = webhook_request.data
    except Exception as e:
        logger.error(f"Invalid webhook payload: {str(e)}")
        return SePayWebhookResponse(
            success=False,
            message=f"Invalid payload: {str(e)}",
            error_code="INVALID_PAYLOAD"
        )
    
    logger.info(f"Received SePay webhook: {transaction.transferContent} - Amount: {transaction.transferAmount}")
    
    # ===== STEP 3: EXTRACT ORDER_ID FROM TRANSFER CONTENT =====
    order_id = extract_order_id_from_content(transaction.transferContent)
    
    if not order_id:
        logger.warning(f"Could not extract order ID from content: {transaction.transferContent}")
        return SePayWebhookResponse(
            success=False,
            message="Order ID not found in transfer content",
            error_code="ORDER_ID_NOT_FOUND"
        )
    
    logger.info(f"Extracted order ID: {order_id}")
    
    # ===== STEP 4: QUERY ORDER FROM DATABASE =====
    order = db.query(Order).filter(Order.order_id == order_id).first()
    
    if not order:
        logger.error(f"Order {order_id} not found in database")
        return SePayWebhookResponse(
            success=False,
            message=f"Order {order_id} not found",
            error_code="ORDER_NOT_FOUND"
        )
    
    logger.info(f"Found order: {order_id}, Status: {order.status.value}, Amount: {order.amount}")
    
    # Nếu đơn hàng đã được xử lý
    if order.status == OrderStatus.PAID:
        logger.info(f"Order {order_id} already paid")
        return SePayWebhookResponse(
            success=True,
            message="Order already processed",
            order_id=order_id
        )
    
    # ===== STEP 5: VERIFY AMOUNT =====
    transferred_amount = transaction.transferAmount
    expected_amount = order.amount
    
    if not check_amount_tolerance(transferred_amount, expected_amount):
        logger.error(
            f"Amount mismatch for order {order_id}. "
            f"Expected: {expected_amount}, Transferred: {transferred_amount}"
        )
        # Cập nhật status thành FAILED thay vì PENDING để admin review
        order.status = OrderStatus.FAILED
        db.commit()
        
        return SePayWebhookResponse(
            success=False,
            message=f"Amount mismatch. Expected: {expected_amount}, Got: {transferred_amount}",
            error_code="AMOUNT_MISMATCH",
            order_id=order_id
        )
    
    # ===== STEP 6: UPDATE ORDER STATUS & APPLY COUPON =====
    try:
        # Bắt đầu transaction
        order.status = OrderStatus.PAID
        
        # Cập nhật usage của coupon nếu có
        if order.coupon_code:
            coupon = db.query(Coupon).filter(Coupon.code == order.coupon_code).first()
            if coupon:
                coupon.usage_count += 1
                db.add(coupon)
                logger.info(f"Incremented coupon usage: {order.coupon_code}")
        
        db.add(order)
        db.flush()  # Đảm bảo order được update trước khi activate course
        
        # ===== STEP 7: ACTIVATE COURSE FOR USER =====
        if order.item_type == "course" and order.item_id:
            try:
                # Import model ở đây để tránh circular import
                from app.models.user_course import UserCourse
                
                # Kiểm tra xem user đã có khóa học này chưa
                existing = db.query(UserCourse).filter(
                    and_(
                        UserCourse.user_id == order.user_id,
                        UserCourse.course_id == int(order.item_id)
                    )
                ).first()
                
                if not existing:
                    # Tạo record UserCourse mới
                    user_course = UserCourse(
                        user_id=order.user_id,
                        course_id=int(order.item_id),
                        order_id=order.id,
                        activated_at=datetime.utcnow(),
                        notes=f"Auto-activated from webhook {transaction.id}"
                    )
                    db.add(user_course)
                    logger.info(f"Activated course {order.item_id} for user {order.user_id}")
                else:
                    logger.warning(f"User {order.user_id} already has course {order.item_id}")
            
            except ValueError:
                logger.error(f"Invalid course ID: {order.item_id}")
        
        # ===== STEP 7B: APPLY GEM PACK FOR USER =====
        elif order.item_type == "gem_pack" and order.item_id:
            try:
                gem_pack = db.query(GemPack).filter(GemPack.id == int(order.item_id)).first()
                if gem_pack:
                    total_gems = PaymentService.apply_gems_to_user(db, order.user, gem_pack)
                    logger.info(f"Applied gem pack {order.item_id} ({total_gems} gems) to user {order.user_id}")
                else:
                    logger.error(f"Gem pack {order.item_id} not found")
            except ValueError as e:
                logger.error(f"Error applying gem pack: {str(e)}")
        
        # ===== STEP 8: SEND CONFIRMATION EMAIL VIA CELERY =====
        try:
            user = order.user
            order_info = {
                "order_id": order.order_id,
                "amount": order.amount,
                "discount_amount": order.discount_amount,
                "final_amount": order.amount - order.discount_amount,
                "item_type": order.item_type,
                "date": datetime.utcnow().strftime("%d/%m/%Y %H:%M:%S"),
                "bank_ref": transaction.referenceCode
            }
            
            # Gửi email qua Celery task (async)
            send_payment_success_email_task.delay(
                user.email,
                user.full_name,
                order_info
            )
            logger.info(f"Queued email task for {user.email}")
        
        except Exception as e:
            logger.error(f"Error sending email for order {order_id}: {str(e)}")
            # Không fail webhook vì email là non-critical
        
        # Commit transaction
        db.commit()
        
        logger.info(f"Order {order_id} payment processed successfully")
        
        return SePayWebhookResponse(
            success=True,
            message="Payment processed successfully",
            order_id=order_id
        )
    
    except Exception as e:
        # Rollback nếu có lỗi
        db.rollback()
        logger.error(f"Error processing webhook for {order_id}: {str(e)}", exc_info=True)
        
        return SePayWebhookResponse(
            success=False,
            message=f"Error processing payment: {str(e)}",
            error_code="PROCESSING_ERROR",
            order_id=order_id
        )