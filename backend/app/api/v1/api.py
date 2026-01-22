from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, users, courses, storage, lessons, progress, dashboard, shop, payment, report, leaderboard
)
from app.api.v1.endpoints import payment
from app.api.v1.endpoints import study
from app.api.v1.endpoints import chat

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(shop.router, prefix="/shop", tags=["shop"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(storage.router, prefix="/storage", tags=["storage"])
api_router.include_router(lessons.router, prefix="/lessons", tags=["lessons"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(payment.router, prefix="/payment", tags=["payment"])
api_router.include_router(report.router, prefix="/reports", tags=["reports"])
api_router.include_router(leaderboard.router, prefix="/leaderboard", tags=["leaderboard"])
api_router.include_router(study.router, prefix="/study", tags=["study"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
