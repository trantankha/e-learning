from minio import Minio
from app.core.config import settings
import uuid
import os

class MinioHandler:
    __instance = None

    @staticmethod
    def get_instance():
        """ Static access method. """
        if MinioHandler.__instance == None:
            MinioHandler()
        return MinioHandler.__instance

    def __init__(self):
        """ Virtually private constructor. """
        if MinioHandler.__instance != None:
            raise Exception("This class is a singleton!")
        else:
            self.client = Minio(
                settings.MINIO_ENDPOINT,
                access_key=settings.MINIO_ACCESS_KEY,
                secret_key=settings.MINIO_SECRET_KEY,
                secure=False # Set to True if using HTTPS
            )
            self.bucket_name = settings.BUCKET_NAME
            self._ensure_bucket_exists()
            MinioHandler.__instance = self

    def _ensure_bucket_exists(self):
        if not self.client.bucket_exists(self.bucket_name):
            self.client.make_bucket(self.bucket_name)
            # Set public policy (read-only)
            policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": ["*"]},
                        "Action": ["s3:GetObject"],
                        "Resource": [f"arn:aws:s3:::{self.bucket_name}/*"]
                    }
                ]
            }
            # Note: setting policy requires raw string or json dump
            import json
            self.client.set_bucket_policy(self.bucket_name, json.dumps(policy))

    def upload_file(self, file_data, file_name: str, content_type: str) -> str:
        """
        Uploads a file to MinIO and returns the public URL.
        """
        try:
            # Generate unique filename to avoid collisions
            ext = os.path.splitext(file_name)[1]
            unique_filename = f"{uuid.uuid4()}{ext}"
            
            # Determine length - file_data is a spool file or bytes
            file_data.seek(0, os.SEEK_END)
            file_size = file_data.tell()
            file_data.seek(0)
            
            self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=unique_filename,
                data=file_data,
                length=file_size,
                content_type=content_type
            )
            
            # Construct public URL
            # Note: settings.MINIO_PUBLIC_ENDPOINT is used for external access (e.g. localhost:9000)
            # We assume http schema here.
            return f"http://{settings.MINIO_PUBLIC_ENDPOINT}/{self.bucket_name}/{unique_filename}"
            
        except Exception as e:
            print(f"Error uploading file to MinIO: {e}")
            raise e

# Create a global instance
minio_handler = MinioHandler()
