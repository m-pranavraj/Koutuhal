import logging
import os
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.core.database import SessionLocal

logger = logging.getLogger(__name__)

async def bootstrap_super_admin():
    """
    Promotes a user to SUPER_ADMIN if INITIAL_SUPER_ADMIN_EMAIL is set.
    This runs on startup.
    """
    target_email = os.getenv("INITIAL_SUPER_ADMIN_EMAIL")
    if not target_email:
        return

    async with SessionLocal() as db:
        try:
            result = await db.execute(select(User).where(User.email == target_email))
            user = result.scalars().first()
            
            if user:
                if user.role != UserRole.SUPER_ADMIN:
                    user.role = UserRole.SUPER_ADMIN
                    user.onboarding_completed = True # Admins don't need onboarding
                    logger.info(f"BOOTSTRAP: Promoted {target_email} to SUPER_ADMIN")
                    await db.commit()
                else:
                    logger.info(f"BOOTSTRAP: {target_email} is already SUPER_ADMIN")
            else:
                logger.warning(f"BOOTSTRAP: User {target_email} not found. Sign up first.")
                
        except Exception as e:
            logger.error(f"BOOTSTRAP FAILED: {e}")

