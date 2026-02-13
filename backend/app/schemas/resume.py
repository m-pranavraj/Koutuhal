from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional, Any, Dict
from datetime import datetime

class ResumeBase(BaseModel):
    title: str = "My Resume"
    content: Dict[str, Any] = Field(default_factory=dict)
    template_id: str = "modern"

class ResumeCreate(ResumeBase):
    pass

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    template_id: Optional[str] = None

class ResumeOut(ResumeBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
