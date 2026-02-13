import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, ForeignKey, DateTime, func, Boolean, Text
from app.core.database import Base

class MentorSession(Base):
    """A booking request from a student to a mentor."""
    __tablename__ = "mentor_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    mentor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    status: Mapped[str] = mapped_column(String, default="PENDING")  # PENDING, ACCEPTED, DECLINED, COMPLETED
    session_type: Mapped[str] = mapped_column(String, default="call")  # call, dm
    message: Mapped[str] = mapped_column(Text, nullable=True)  # Initial message from student
    mentor_reply: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
