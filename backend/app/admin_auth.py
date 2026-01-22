from sqladmin.authentication import AuthenticationBackend
from fastapi import Request
from sqlalchemy.orm import Session
from app.core import security
from app.core.database import SessionLocal
from app.models.user import User
from app.models.enums import UserRole

class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        email = form.get("username")
        password = form.get("password")

        # Create a new session for this request
        db: Session = SessionLocal()
        try:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                return False
            
            if not security.verify_password(password, user.hashed_password):
                return False

            # Check if user is admin
            if user.role != UserRole.ADMIN:
                 return False

            # Create session token
            token = security.create_access_token(user.id)
            request.session.update({"token": token})
            return True
        finally:
            db.close()

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        token = request.session.get("token")
        if not token:
            return False
        return True

admin_auth = AdminAuth(secret_key="super_secret_key_change_me")
