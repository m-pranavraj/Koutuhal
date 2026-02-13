from typing import Any, Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime, timedelta, timezone

from app.api import deps
from app.models.application import Application
from app.models.resume import Resume
from app.models.job import Job
from app.models.user import User
from app.schemas.dashboard import DashboardStatsOut
from app.core.database import get_db

router = APIRouter()

@router.get("/stats", response_model=DashboardStatsOut)
async def get_dashboard_stats(
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    Get dashboard statistics for the current user.
    """
    # 1. Total Resumes
    result = await db.execute(
        select(func.count(Resume.id)).where(Resume.user_id == current_user.id)
    )
    total_resumes = result.scalar() or 0

    # 2. Total Applications & 3. Applications this week
    # We can do this in separate queries for clarity
    
    # Total Applications
    result = await db.execute(
        select(func.count(Application.id)).where(Application.user_id == current_user.id)
    )
    total_applications = result.scalar() or 0
    
    # Applications this week
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    # Note: If created_at is naive, this might need adjustment. 
    # Usually we use timezone-aware datetimes in Postgres.
    
    result = await db.execute(
        select(func.count(Application.id))
        .where(Application.user_id == current_user.id)
        .where(Application.created_at >= seven_days_ago)
    )
    applications_this_week = result.scalar() or 0
    
    # 4. Average Match Score
    result = await db.execute(
        select(func.avg(Application.match_score))
        .where(Application.user_id == current_user.id)
        .where(Application.match_score.is_not(None))
    )
    avg_match_score = result.scalar() # Returns float or None
    
    # 5. Latest Application Date
    result = await db.execute(
        select(func.max(Application.created_at))
        .where(Application.user_id == current_user.id)
    )
    latest_application_date = result.scalar() # Returns datetime or None
    
    # 6. Total Jobs (Optional but requested)
    result = await db.execute(select(func.count(Job.id)))
    total_jobs = result.scalar() or 0
    
    return {
        "total_resumes": total_resumes,
        "total_applications": total_applications,
        "applications_this_week": applications_this_week,
        "avg_match_score": avg_match_score,
        "latest_application_date": latest_application_date,
        "total_jobs": total_jobs
    }
