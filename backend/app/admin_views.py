from sqladmin import ModelView
from app.models.user import User
from app.models.curriculum import Course, Unit, Lesson, Question
from app.models.enums import UserRole
from app.services.storage import minio_handler
from fastapi import UploadFile
from typing import Any
from app.models.order import Order
from app.models.coupon import Coupon
from app.core import security
from wtforms import PasswordField

class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.email, User.full_name, User.role, User.student_profile, User.is_active]
    column_searchable_list = [User.email, User.full_name]
    can_create = True
    can_edit = True
    can_delete = True
    icon = "fa-solid fa-user"

    form_columns = [User.email, User.hashed_password, User.full_name, User.role, User.is_active]
    
    form_overrides = dict(hashed_password=PasswordField)
    
    form_args = dict(
        hashed_password=dict(
            label="Password", 
            render_kw={
                "autocomplete": "new-password", 
                "class": "form-control", 
                "placeholder": "(This info is private, leave blank to keep unchanged)"
            }
        ),
        email=dict(render_kw={"autocomplete": "off", "class": "form-control"}),
        full_name=dict(render_kw={"autocomplete": "off", "class": "form-control"})
    )

    async def on_model_change(self, data: dict, model: Any, is_created: bool, request: Any) -> None:
        raw_password = data.get("hashed_password")
        
        if raw_password:
            # User entered a new password -> Hash it
            data["hashed_password"] = security.get_password_hash(raw_password)
        elif is_created:
            # Creation requires password
            raise ValueError("Mật khẩu là bắt buộc khi tạo tài khoản mới.")
        else:
             # Edit mode and empty password field -> Do not update/touch the field
             if "hashed_password" in data: del data["hashed_password"]

class CourseAdmin(ModelView, model=Course):
    column_list = [Course.id, Course.title, Course.level]
    can_create = True
    can_edit = True
    can_delete = True
    icon = "fa-solid fa-book"

class UnitAdmin(ModelView, model=Unit):
    column_list = [Unit.id, Unit.title, Unit.course_id, Unit.order_index]
    can_create = True
    can_edit = True
    can_delete = True
    icon = "fa-solid fa-bookmark"
    
    form_args = dict(
        order_index=dict(label="Display Order (Priority)")
    )

from wtforms import FileField

class LessonAdmin(ModelView, model=Lesson):
    column_list = [Lesson.id, Lesson.title, Lesson.unit, Lesson.lesson_type, Lesson.pronunciation_word]
    
    # Explicitly list all fields,    # Explicitly list all fields
    form_columns = [
        Lesson.title, 
        Lesson.unit, 
        Lesson.lesson_type, 
        Lesson.order_index, 
        Lesson.pronunciation_word,
        Lesson.video_url, 
        Lesson.thumbnail_url, 
        Lesson.attachment_url
    ]

    can_create = True
    can_edit = True
    can_delete = True
    icon = "fa-solid fa-graduation-cap"
    
    # Override URL fields with FileField so they show as Upload inputs
    form_overrides = dict(
        video_url=FileField,
        thumbnail_url=FileField,
        attachment_url=FileField
    )
    
    # Label them nicely
    form_args = dict(
        video_url=dict(label="Upload Video"),
        thumbnail_url=dict(label="Upload Thumbnail"),
        attachment_url=dict(label="Upload Attachment"),
        order_index=dict(label="Display Order (Priority)")
    )

    async def on_model_change(self, data: dict, model: Any, is_created: bool, request: Any) -> None:
        
        async def process_file(field_name):
            file_obj = data.get(field_name)
            
            # Check if it's a file upload
            if file_obj and hasattr(file_obj, "filename") and file_obj.filename:
                 content_type = file_obj.content_type or "application/octet-stream"
                 url = minio_handler.upload_file(file_obj.file, file_obj.filename, content_type)
                 # Replace the file object with the URL string in data
                 data[field_name] = url
            else:
                # If no file uploaded (or empty), we want to preserve existing value on Edit.
                # If we leave it as None/Empty object, it might try to set URL to Null/None.
                # Removing it from data ensures we don't overwrite existing value.
                if field_name in data:
                    del data[field_name]

        await process_file('video_url')
        await process_file('thumbnail_url')
        await process_file('attachment_url')

class QuestionAdmin(ModelView, model=Question):
    column_list = [Question.id, Question.text, Question.lesson_id]
    can_create = True
    can_edit = True
    can_delete = True
    icon = "fa-solid fa-question"


class OrderAdmin(ModelView, model=Order):
    column_list = [Order.id, Order.order_id, Order.user, Order.amount, Order.status, Order.created_at]
    column_sortable_list = [Order.created_at, Order.amount, Order.status]
    column_searchable_list = [Order.order_id, Order.description]
    # can_create = False # Normally we don't create orders manually
    # can_edit = True # Maybe to verify manually
    can_delete = True
    icon = "fa-solid fa-money-bill"

class CouponAdmin(ModelView, model=Coupon):
    column_list = [Coupon.code, Coupon.discount_type, Coupon.discount_value, Coupon.expiry_date, Coupon.is_active, Coupon.usage_count]
    form_columns = [Coupon.code, Coupon.discount_type, Coupon.discount_value, Coupon.max_usage, Coupon.expiry_date, Coupon.is_active]
    can_create = True
    can_edit = True
    can_delete = True
    icon = "fa-solid fa-ticket"
