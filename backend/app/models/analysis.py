import uuid
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, DateTime, ForeignKey, func, Text
from app.core.database import Base
from typing import Optional, List

class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    resume_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("resumes.id"), index=True, nullable=False)
    
    role: Mapped[str] = mapped_column(String, nullable=True) # Target roles analyzed
    job_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    score: Mapped[int] = mapped_column(Integer, default=0)
    strengths: Mapped[Optional[List[str]]] = mapped_column(JSONB, nullable=True)
    gaps: Mapped[Optional[List[str]]] = mapped_column(JSONB, nullable=True)
    better_roles: Mapped[Optional[List[dict]]] = mapped_column(JSONB, nullable=True) # Recommendations
    
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
