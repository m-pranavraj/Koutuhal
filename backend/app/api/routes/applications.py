from typing import Any, Annotated, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.api import deps
from app.models.application import Application
from app.models.user import User
from app.schemas.application import ApplicationOut, ApplicationStatusOut
from app.core.database import get_db, AsyncSessionLocal
import uuid
import random
import asyncio
from datetime import datetime, timezone

router = APIRouter()

# --- Background Task ---
async def recompute_application_score_task(application_id: uuid.UUID):
    """
    Simulates a long-running AI scoring process.
    """
    # Create a new session for the background task
    async with AsyncSessionLocal() as db:
        try:
            # Simulate processing delay
            await asyncio.sleep(5) 

            # Fetch application
            result = await db.execute(select(Application).where(Application.id == application_id))
            application = result.scalars().first()
            
            if not application:
                return

            # Create Async AI Job for scoring
            from app.models.ai_job import AIJob, JobStatus
            from app.services.ai_queue import queue_service

            # Create Job Record
            job = AIJob(
                user_id=application.user_id,
                job_type="application_scoring", # Specialized job type for applications
                status=JobStatus.PENDING,
                input_ref=str(application.id) # Reference the application ID
            )
            db.add(job)
            await db.commit()
            await db.refresh(job)

            # Enqueue to Redis
            queue_service.enqueue_job({
                "job_id": str(job.id),
                "job_type": "application_scoring",
                "input_ref": str(application.id)
            })
            
            # Update application state
            application.processing_state = "processing"
            # application.rank = new_rank # Will be set by worker
            # application.match_score = new_score # Will be set by worker
            application.updated_at = datetime.now(timezone.utc)
            
            db.add(application)
            await db.commit()
            
        except Exception as e:
            # Handle failure
            print(f"Background task failed: {e}")
            result = await db.execute(select(Application).where(Application.id == application_id))
            application = result.scalars().first()
            if application:
                application.processing_state = "failed"
                application.last_error = str(e)
                application.updated_at = datetime.now(timezone.utc)
                db.add(application)
                await db.commit()

# --- Routes ---

@router.get("/", response_model=List[ApplicationOut])
async def read_applications(
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all applications for current user.
    """
    result = await db.execute(
        select(Application)
        .where(Application.user_id == current_user.id)
        .order_by(desc(Application.created_at))
        .offset(skip)
        .limit(limit)
    )
    applications = result.scalars().all()
    return applications

@router.get("/{id}/status", response_model=ApplicationStatusOut)
async def get_application_status(
    id: uuid.UUID,
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    Poll application status.
    """
    result = await db.execute(select(Application).where(Application.id == id))
    application = result.scalars().first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if application.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return application

@router.post("/{id}/recompute", response_model=ApplicationStatusOut)
async def recompute_application(
    id: uuid.UUID,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    Trigger AI re-scoring for an application.
    """
    result = await db.execute(select(Application).where(Application.id == id))
    application = result.scalars().first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if application.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Idempotency check
    if application.processing_state == "processing":
        raise HTTPException(status_code=409, detail="Application is already being processed")
        
    # Set state to processing immediately
    application.processing_state = "processing"
    application.last_error = None
    application.updated_at = datetime.now(timezone.utc)
    
    db.add(application)
    await db.commit()
    await db.refresh(application)
    
    # Enqueue background task
    background_tasks.add_task(recompute_application_score_task, application.id)
    
    return application
