from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional
from datetime import datetime

class JobBase(BaseModel):
    title: str
    company: str
    description: str
    skills: List[str]
    location: str
    job_type: str

class JobCreate(JobBase):
    pass

class JobOut(JobBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
