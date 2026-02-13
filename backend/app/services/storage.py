import os
import uuid
import hashlib
from typing import Optional, Dict
from datetime import timedelta
from app.core.config import settings

# Try updating imports, if failed use mocks
try:
    from google.cloud import storage
    GCS_AVAILABLE = True
except ImportError:
    GCS_AVAILABLE = False
    print("Warning: google-cloud-storage not installed. Storage will default to Local.")

class StorageService:
    def __init__(self):
        self.storage_type = settings.STORAGE_TYPE
        self.local_path = settings.LOCAL_STORAGE_PATH
        self.bucket_name = settings.GCS_BUCKET_NAME
        self.client = None
        
        if self.storage_type == "gcs" and GCS_AVAILABLE and settings.GOOGLE_APPLICATION_CREDENTIALS:
            try:
                self.client = storage.Client()
            except Exception as e:
                print(f"Failed to init GCS client: {e}")
        
        # Ensure local storage path exists
        if self.storage_type == "local":
            if not os.path.exists(self.local_path):
                os.makedirs(self.local_path)
                print(f"Created local storage directory: {self.local_path}")

    async def upload_file(self, file_bytes: bytes, filename: str, content_type: str) -> Dict[str, str]:
        """
        Uploads file to GCS (or mocks it).
        Returns dict with 'bucket_path'.
        """
        unique_name = f"{uuid.uuid4().hex}-{filename}"
        
        if self.storage_type == "gcs" and self.client:
            try:
                bucket = self.client.bucket(self.bucket_name)
                blob = bucket.blob(unique_name)
                
                # Upload
                blob.upload_from_string(
                    file_bytes,
                    content_type=content_type
                )
                
                return {
                    "bucket_path": unique_name
                }
            except Exception as e:
                print(f"GCS Upload Error: {e}")
                raise e
        
        # Local Storage behavior
        file_path = os.path.join(self.local_path, unique_name)
        with open(file_path, "wb") as f:
            f.write(file_bytes)
            
        return {
            "bucket_path": unique_name
        }

    async def download_file(self, bucket_path: str) -> bytes:
        """
        Download file from storage.
        """
        if self.storage_type == "gcs" and self.client and not bucket_path.startswith("mock/"):
            try:
                bucket = self.client.bucket(self.bucket_name)
                blob = bucket.blob(bucket_path)
                return blob.download_as_bytes()
            except Exception as e:
                raise e
        
        # Local Storage behavior
        file_path = os.path.join(self.local_path, bucket_path)
        if os.path.exists(file_path):
            with open(file_path, "rb") as f:
                return f.read()
        
        raise FileNotFoundError(f"File not found in storage: {bucket_path}")

    def generate_signed_url(self, bucket_path: str, expires_minutes: int = 15) -> Optional[str]:
        """
        Generates a V4 Signed URL for temporary access.
        """
        if self.storage_type == "gcs" and self.client:
            try:
                bucket = self.client.bucket(self.bucket_name)
                blob = bucket.blob(bucket_path)
                
                url = blob.generate_signed_url(
                    version="v4",
                    expiration=timedelta(minutes=expires_minutes),
                    method="GET",
                    # allows browsers to display inline if content-type matches
                    response_disposition="inline" 
                )
                return url
            except Exception as e:
                print(f"Signed URL Generation Error: {e}")
                return None
        
        # Local Storage behavior: Return a simple local path or a relative URL
        # We return a path that our backend can serve
        # If the frontend is on 5173 and backend on 8000, we can point to /api/v1/files/download/{bucket_path}
        return f"/api/v1/files/download/{bucket_path}"

    async def delete_file(self, bucket_path: str) -> bool:
        """
        Deletes file from GCS.
        """
        if self.storage_type == "gcs" and self.client:
            try:
                bucket = self.client.bucket(self.bucket_name)
                blob = bucket.blob(bucket_path)
                blob.delete()
                return True
            except Exception as e:
                print(f"GCS Delete Error: {e}")
                return False
        
        # Local Storage behavior
        file_path = os.path.join(self.local_path, bucket_path)
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
            
        return False

storage_service = StorageService()
