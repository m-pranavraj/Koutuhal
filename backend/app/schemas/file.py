from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime

class UploadedFileOut(BaseModel):
    id: UUID
    original_filename: str
    content_type: str
    size_bytes: int
    signed_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
