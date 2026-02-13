from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime

class ApplicationCreate(BaseModel):
    resume_id: UUID

class ApplicationOut(BaseModel):
    id: UUID
    job_id: UUID
    status: str
    rank: Optional[int]
    match_score: Optional[int]
    processing_state: str
    last_error: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ApplicationStatusOut(BaseModel):
    id: UUID
    status: str
    processing_state: str
    rank: Optional[int]
    match_score: Optional[int]
    last_error: Optional[str]
    updated_at: datetime
    
    class Config:
        from_attributes = True
