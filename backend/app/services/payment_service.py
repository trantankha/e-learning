from sqlalchemy.orm import Session
from typing import Optional
from app.models.gem_pack import GemPack
from app.models.order import Order, OrderStatus
from app.models.coupon import Coupon
from app.models.enums import DiscountType
from app.models.user import User
from app.schemas.gem_pack import GemOrderResponse
import uuid
import logging

logger = logging.getLogger(__name__)


class PaymentService:
    """Service xử lý thanh toán"""

    @staticmethod
    def create_gem_order(
        db: Session,
        user: User,
        gem_pack_id: int,
        coupon_code: Optional[str] = None
    ) -> tuple[Order, GemOrderResponse]:
        """
        Tạo đơn hàng mua Gem
        
        Returns:
            tuple[Order, GemOrderResponse]: Database order object và response để trả về client
        """
        from typing import Optional
        
        # 1. Get GemPack
        gem_pack = db.query(GemPack).filter(GemPack.id == gem_pack_id).first()
        if not gem_pack:
            raise ValueError(f"Gem pack {gem_pack_id} not found")
        
        if not gem_pack.is_active:
            raise ValueError(f"Gem pack {gem_pack_id} is not active")
        
        # 2. Calculate final price with coupon
        original_price = gem_pack.price_vnd
        discount_amount = 0.0
        final_amount = original_price
        
        if coupon_code:
            coupon, error = PaymentService.validate_coupon(db, coupon_code)
            if error:
                raise ValueError(error)
            
            # Calculate discount
            if coupon.discount_type == DiscountType.PERCENT:
                discount_amount = original_price * (coupon.discount_value / 100.0)
            elif coupon.discount_type == DiscountType.FIXED_AMOUNT:
                discount_amount = float(coupon.discount_value)
            
            # Cap discount không vượt quá original price
            if discount_amount > original_price:
                discount_amount = original_price
            
            final_amount = original_price - discount_amount
        
        # 3. Create Order ID
        order_id = f"DH{int(uuid.uuid4().int % 1000000)}"
        
        # 4. Save to DB
        new_order = Order(
            user_id=user.id,
            order_id=order_id,
            amount=final_amount,
            description=f"Mua {gem_pack.name}",
            item_type="gem_pack",
            item_id=str(gem_pack_id),
            status=OrderStatus.PENDING,
            coupon_code=coupon_code,
            discount_amount=discount_amount
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        
        # 5. Build response (QR URL sẽ được sinh ở frontend bằng SePay API)
        response = GemOrderResponse(
            order_id=order_id,
            gem_pack_id=gem_pack_id,
            gem_amount=gem_pack.gem_amount,
            total_gems=gem_pack.get_total_gems(),
            original_price=original_price,
            discount_amount=discount_amount,
            final_amount=final_amount,
            status=new_order.status.value,
            qr_url="",  # QR URL được sinh ở frontend
            coupon_code=coupon_code
        )
        
        return new_order, response

    @staticmethod
    def validate_coupon(db: Session, code: str) -> tuple[Coupon | None, str | None]:
        """
        Kiểm tra mã giảm giá
        
        Returns:
            tuple[Coupon | None, str | None]: (coupon object, error message)
        """
        from datetime import datetime
        
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

    @staticmethod
    def apply_gems_to_user(db: Session, user: User, gem_pack: GemPack) -> int:
        """
        Cộng Gem cho user khi thanh toán thành công
        
        Returns:
            int: Tổng số gem được cộng
        """
        if not user.student_profile:
            raise ValueError(f"User {user.id} doesn't have student profile")
        
        total_gems_to_add = gem_pack.get_total_gems()
        user.student_profile.total_gems += total_gems_to_add
        db.add(user.student_profile)
        db.commit()
        
        logger.info(f"Added {total_gems_to_add} gems to user {user.email}. "
                   f"New balance: {user.student_profile.total_gems}")
        
        return total_gems_to_add
