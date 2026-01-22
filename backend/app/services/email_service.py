from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings
from pathlib import Path
from typing import Dict, Any

class EmailService:
    def __init__(self):
        self.conf = ConnectionConfig(
            MAIL_USERNAME=settings.MAIL_USERNAME,
            MAIL_PASSWORD=settings.MAIL_PASSWORD,
            MAIL_FROM=settings.MAIL_FROM,
            MAIL_PORT=settings.MAIL_PORT,
            MAIL_SERVER=settings.MAIL_SERVER,
            MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
            MAIL_STARTTLS=settings.MAIL_STARTTLS,
            MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
            USE_CREDENTIALS=settings.USE_CREDENTIALS,
            VALIDATE_CERTS=settings.VALIDATE_CERTS,
            TEMPLATE_FOLDER=Path(__file__).parent.parent / 'templates' / 'email'
        )
        self.fm = FastMail(self.conf)

    async def send_welcome_email(self, email_to: str, full_name: str):
        template_body = {
            "full_name": full_name,
            "project_url": "http://localhost:3000"
        }
        
        message = MessageSchema(
            subject="Chào mừng đến với Kids English E-Learning",
            recipients=[email_to],
            template_body=template_body,
            subtype=MessageType.html
        )
        await self.fm.send_message(message, template_name="welcome.html")

    async def send_payment_success_email(self, email_to: str, full_name: str, order_info: Dict[str, Any]):
        template_body = {
            "full_name": full_name,
            "order_id": order_info.get("order_id"),
            "description": order_info.get("description"),
            "amount": "{:,.0f}".format(order_info.get("amount", 0)),
            "date": order_info.get("date"),
            "project_url": "http://localhost:3000/shop"
        }

        message = MessageSchema(
            subject=f"Xác nhận thanh toán thành công - Đơn hàng #{order_info.get('order_id')}",
            recipients=[email_to],
            template_body=template_body,
            subtype=MessageType.html
        )
        await self.fm.send_message(message, template_name="payment_success.html")

email_service = EmailService()
