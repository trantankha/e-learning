from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.models import Base
from app.api.v1.api import api_router
from app.core.database import engine, init_db
from sqladmin import Admin
from app.admin_auth import admin_auth
from app.admin_views import UserAdmin, CourseAdmin, UnitAdmin, LessonAdmin, QuestionAdmin, OrderAdmin, CouponAdmin

init_db()
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to Kids English E-Learning API"}

app.include_router(api_router, prefix=settings.API_V1_STR)

# Admin Interface Integration
admin = Admin(app, engine, authentication_backend=admin_auth)
admin.add_view(UserAdmin)
admin.add_view(CourseAdmin)
admin.add_view(UnitAdmin)
admin.add_view(LessonAdmin)
admin.add_view(QuestionAdmin)
admin.add_view(OrderAdmin)
admin.add_view(CouponAdmin)
