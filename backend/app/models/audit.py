import uuid
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime, func, ForeignKey
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True) # Nullable for system actions
    
    action: Mapped[str] = mapped_column(String, nullable=False, index=True) # e.g. "LOGIN", "PAYMENT_VERIFIED"
    entity_type: Mapped[str] = mapped_column(String, nullable=False, index=True) # e.g. "order", "file"
    entity_id: Mapped[str | None] = mapped_column(String, nullable=True) # ID of the entity
    
    metadata_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True) # Extra context
    
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
