import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, ForeignKey, DateTime, func, UniqueConstraint
from app.core.database import Base
from app.models.job import Job  # For relationship if needed, though usually just ID for now

class Application(Base):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    job_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("jobs.id"), index=True, nullable=False)
    resume_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("resumes.id"), nullable=False)
    
    status: Mapped[str] = mapped_column(String, default="APPLIED", nullable=False)
    rank: Mapped[int | None] = mapped_column(Integer, nullable=True)
    match_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    processing_state: Mapped[str] = mapped_column(String, default="scored", nullable=False) # pending, processing, scored, failed. Default 'scored' for existing rows/new-legacy logic.
    last_error: Mapped[str | None] = mapped_column(String, nullable=True)
    
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'job_id', name='uq_user_job_application'),
    )
