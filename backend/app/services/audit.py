from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit import AuditLog
from typing import Optional, Dict, Any
import logging
import uuid
import json

logger = logging.getLogger(__name__)

class AuditService:
    async def log_action(
        self,
        db: AsyncSession,
        action: str,
        entity_type: str,
        entity_id: Optional[str] = None,
        user_id: Optional[uuid.UUID] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """
        Logs an audit event to the database.
        Use inside an existing transaction if possible.
        """
        try:
            log_entry = AuditLog(
                user_id=user_id,
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                metadata_json=metadata
            )
            db.add(log_entry)
            # If we are in a transaction, we don't commit here. 
            # The caller handles commit.
            # But we can flush to get ID if needed? No need.
            
            logger.info(
                f"AUDIT_LOG: {action} on {entity_type}:{entity_id} by {user_id}",
                extra={
                    "audit_action": action,
                    "audit_entity": entity_type,
                    "audit_user": str(user_id) if user_id else "system"
                }
            )
        except Exception as e:
            logger.error(f"Failed to create audit log: {e}")
            # In strict mode, we might want to raise, but generally we don't want audit logging failure to crash the app logic 
            # unless it's strictly required by compliance (SCROLL_MODE).
            # For this task, "Failure to write audit log should FAIL the operation (for critical actions)".
            raise e

audit_service = AuditService()
