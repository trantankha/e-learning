import asyncio
from app.core.celery_app import celery_app
from app.services.email_service import email_service
from typing import Dict, Any

# Wrapper to run async functions in sync Celery task
def run_async(coroutine):
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # If we are in an event loop (e.g. running locally with uvicorn reloader potentially?), 
            # we shouldn't be here because Celery worker is sync.
            # But just in case, use create_task or similar if possible, but strict sync is better.
            # Actually, asyncio.run() fails if loop is running.
            pass
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    return asyncio.run(coroutine)

@celery_app.task(autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={'max_retries': 3})
def send_welcome_email_task(email_to: str, full_name: str):
    return asyncio.run(email_service.send_welcome_email(email_to, full_name))

@celery_app.task(autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={'max_retries': 3})
def send_payment_success_email_task(email_to: str, full_name: str, order_info: Dict[str, Any]):
    return asyncio.run(email_service.send_payment_success_email(email_to, full_name, order_info))
