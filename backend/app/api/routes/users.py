from typing import Any, Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api import deps
from app.core.database import get_db
from app.models.user import User, UserRole
from app.services.audit import audit_service
from pydantic import BaseModel
import uuid

router = APIRouter()

class MentorProfile(BaseModel):
    id: uuid.UUID
    name: str
    bio: str | None = None
    avatar_url: str | None = None
    xp_points: int = 0

    class Config:
        from_attributes = True

from typing import List

@router.get("/mentors", response_model=List[MentorProfile])
async def list_mentors(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """List all users with MENTOR role (public)."""
    result = await db.execute(
        select(User).where(User.role == UserRole.MENTOR)
    )
    mentors = result.scalars().all()
    return mentors

class UserProfile(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: UserRole
    onboarding_completed: bool
    avatar_url: str | None
    
    class Config:
        from_attributes = True

class SetRoleRequest(BaseModel):
    role: UserRole

@router.get("/me", response_model=UserProfile)
async def read_users_me(
    current_user: Annotated[User, Depends(deps.get_current_user)],
) -> Any:
    """
    Get current user profile.
    """
    return current_user

@router.post("/set-role", response_model=UserProfile)
async def set_user_role(
    role_req: SetRoleRequest,
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    Set user role (Onboarding).
    Can only be done ONCE if onboarding_completed is False.
    """
    if current_user.onboarding_completed:
        raise HTTPException(status_code=400, detail="Role already set. Contact admin to change.")
        
    if role_req.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Cannot self-assign Admin role.")
        
    current_user.role = role_req.role
    current_user.onboarding_completed = True
    
    # Audit Log
    await audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="ROLE_SELF_ASSIGNED",
        entity_type="user",
        entity_id=str(current_user.id),
        metadata={"role": role_req.role}
    )
    
    await db.commit()
    await db.refresh(current_user)
    return current_user
