from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "worker", 
    broker=settings.CELERY_BROKER_URL,
    include=['app.services.tasks']
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Ho_Chi_Minh",
    enable_utc=True,
    broker_connection_retry_on_startup=True,
)

