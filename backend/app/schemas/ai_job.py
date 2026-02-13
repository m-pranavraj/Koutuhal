from pydantic import BaseModel
from uuid import UUID
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.ai_job import JobStatus

class AIJobCreate(BaseModel):
    job_type: str
    input_ref: Optional[str] = None

class AIJobOut(BaseModel):
    id: UUID
    user_id: UUID
    job_type: str
    status: JobStatus
    input_ref: Optional[str]
    result_json: Optional[Dict[str, Any]]
    error: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AIJobStatus(BaseModel):
    id: UUID
    status: JobStatus
