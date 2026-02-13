from typing import Any, Annotated, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.api import deps
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.payment import Order, UserEntitlement
from app.models.ai_job import AIJob
from app.models.file import UploadedFile
from app.services.audit import audit_service
from app.services.excel import excel_service
from pydantic import BaseModel
import uuid
from datetime import datetime

router = APIRouter()

# --- Response Models ---
class AdminUserList(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: UserRole
    created_at: datetime
    
    class Config:
        from_attributes = True

class AdminOrderList(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    status: str
    amount: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Endpoints ---

@router.get("/users", response_model=List[AdminUserList])
async def list_users(
    current_user: Annotated[User, Depends(deps.require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Admin: List all users.
    """
    result = await db.execute(select(User).offset(skip).limit(limit))
    return result.scalars().all()

@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: uuid.UUID,
    role: UserRole,
    current_user: Annotated[User, Depends(deps.require_super_admin)], # Only Super Admin can change roles
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    Super Admin: Change user role.
    """
    # Fetch target user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
         raise HTTPException(status_code=404, detail="User not found")
         
    old_role = user.role
    user.role = role
    
    # Audit
    await audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="ADMIN_UPDATE_ROLE",
        entity_type="user",
        entity_id=str(user.id),
        metadata={"old_role": old_role, "new_role": role}
    )
    
    await db.commit()
    return {"status": "success", "user_id": user_id, "new_role": role}

@router.get("/orders", response_model=List[AdminOrderList])
async def list_orders(
    current_user: Annotated[User, Depends(deps.require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status: str | None = Query(None)
) -> Any:
    """
    Admin: List orders/payments.
    """
    query = select(Order)
    if status:
        query = query.where(Order.status == status)
    query = query.order_by(Order.created_at.desc()).limit(100)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/analytics/stats")
async def get_stats(
    current_user: Annotated[User, Depends(deps.require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    Admin: Dashboard stats.
    """
    user_count = await db.scalar(select(func.count(User.id)))
    order_count = await db.scalar(select(func.count(Order.id)))
    file_count = await db.scalar(select(func.count(UploadedFile.id)))
    job_count = await db.scalar(select(func.count(AIJob.id)))
    
    return {
        "users": user_count,
        "orders": order_count,
        "files": file_count,
        "ai_jobs": job_count
    }

@router.get("/export/users")
async def export_users_excel(
    current_user: Annotated[User, Depends(deps.require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    Admin: Export users to CSV.
    """
    result = await db.execute(select(User))
    users = result.scalars().all()
    
    # Convert models to dicts for CSV export
    user_data = []
    for u in users:
        user_data.append({
            "id": str(u.id),
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "created_at": str(u.created_at)
        })
        
    return excel_service.export_to_csv(user_data, "users_export")
