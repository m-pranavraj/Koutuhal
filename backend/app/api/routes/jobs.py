from typing import Any, Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.api import deps
from app.models.job import Job
from app.models.application import Application
from app.models.resume import Resume
from app.models.user import User
from app.schemas.job import JobOut, JobCreate
from app.schemas.application import ApplicationOut, ApplicationCreate
from app.core.database import get_db
import uuid
import random

router = APIRouter()

@router.get("/", response_model=List[JobOut])
async def read_jobs(
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all jobs (public).
    """
    result = await db.execute(
        select(Job)
        .order_by(desc(Job.created_at))
        .offset(skip)
        .limit(limit)
    )
    jobs = result.scalars().all()
    return jobs

@router.get("/{id}", response_model=JobOut)
async def read_job(
    id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    Get job by ID.
    """
    result = await db.execute(select(Job).where(Job.id == id))
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/{id}/apply", response_model=ApplicationOut)
async def apply_to_job(
    id: uuid.UUID,
    application_in: ApplicationCreate,
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    Apply to a job.
    """
    # Check if job exists
    result = await db.execute(select(Job).where(Job.id == id))
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Check if resume belongs to user
    result = await db.execute(select(Resume).where(Resume.id == application_in.resume_id))
    resume = result.scalars().first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if resume.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only apply with your own resume")

    # Check if already applied
    result = await db.execute(
        select(Application)
        .where(Application.user_id == current_user.id)
        .where(Application.job_id == id)
    )
    existing_application = result.scalars().first()
    if existing_application:
        raise HTTPException(status_code=400, detail="You have already applied to this job")

    # Create application with random rank/score
    application = Application(
        user_id=current_user.id,
        job_id=id,
        resume_id=application_in.resume_id,
        status="APPLIED",
        processing_state="pending", # Start as pending
        rank=None, # To be filled by AI
        match_score=None # To be filled by AI
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)

    # --- Trigger AI Scoring ---
    from app.models.ai_job import AIJob, JobStatus
    from app.services.ai_queue import queue_service

    ai_job = AIJob(
        user_id=current_user.id,
        job_type="application_scoring",
        status=JobStatus.PENDING,
        input_ref=str(application.id)
    )
    db.add(ai_job)
    await db.commit()
    await db.refresh(ai_job)

    queue_service.enqueue_job({
        "job_id": str(ai_job.id),
        "job_type": "application_scoring",
        "input_ref": str(application.id)
    })
    
    return application

# Admin route to seed jobs (temporary)
@router.post("/seed", status_code=201)
async def seed_jobs(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(deps.require_admin)],
) -> Any:
    """
    Seed initial jobs.
    """
    jobs_data = [
        {
            "title": "Senior Frontend Engineer",
            "company": "TechFlow AI",
            "description": "We are looking for a Senior Frontend Engineer to join our core product team.",
            "skills": ["React", "TypeScript", "Tailwind CSS"],
            "location": "Remote",
            "job_type": "Full-time"
        },
        {
            "title": "Backend Developer",
            "company": "DataStreams Inc.",
            "description": "Join our backend team to build scalable data pipelines.",
            "skills": ["Python", "FastAPI", "PostgreSQL"],
            "location": "New York, NY",
            "job_type": "Full-time"
        },
        {
            "title": "Product Designer",
            "company": "Creative Studio",
            "description": "Design beautiful and intuitive user interfaces.",
            "skills": ["Figma", "UI/UX", "Prototyping"],
            "location": "San Francisco, CA",
            "job_type": "Contract"
        }
    ]
    
    for job_data in jobs_data:
        job = Job(**job_data)
        db.add(job)
    
    await db.commit()
    return {"message": "Jobs seeded successfully"}
