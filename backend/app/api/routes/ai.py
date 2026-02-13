from typing import Any, Annotated, List, Dict
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.api import deps
from app.models.job import Job
from app.models.user import User
from app.schemas.ai import ResumeAnalysisOut, JobMatchOut
from app.core.database import get_db
import random
import time
import hashlib
from datetime import datetime
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from app.core.config import settings

from app.models.file import UploadedFile
from app.services.storage import storage_service
from app.models.ai_job import AIJob, JobStatus
from app.schemas.ai_job import AIJobOut
from app.services.ai_queue import queue_service
from app.services.audit import audit_service
import uuid

from app.core.limiter import limiter
from fastapi import Request

router = APIRouter()

@router.post("/analyze-resume", response_model=AIJobOut)
@limiter.limit("3/minute")
async def analyze_resume(
    request: Request,
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    resume: Annotated[UploadFile, File()],
    jd_text: Annotated[str, Form()],
) -> Any:
    """
    Simulates AI Resume Analysis with GCS Storage.
    Returns: AIJob (Pending)
    """
    # 1. File Type Validation
    ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]
    if resume.content_type not in ALLOWED_TYPES and not resume.filename.lower().endswith(('.pdf', '.docx', '.txt')):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only PDF and DOCX are allowed.",
        )
    
    # 2. File Size Validation (Check Content-Length header first)
    if resume.size and resume.size > settings.MAX_UPLOAD_MB * 1024 * 1024:
         raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size is {settings.MAX_UPLOAD_MB}MB.",
        )

    # Read content
    file_content = await resume.read()
    file_size = len(file_content)
    
    # Strict Size Check after reading
    if file_size > settings.MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size is {settings.MAX_UPLOAD_MB}MB.",
        )
        
    # 3. Daily Limit Check
    today = datetime.now().date()
    # Count files uploaded by user today
    # Note: This query might be slow if many files, index on created_at helps.
    # For now, simplistic approach.
    query = select(func.count()).select_from(UploadedFile).where(
        UploadedFile.user_id == current_user.id,
        func.date(UploadedFile.created_at) == today
    )
    result = await db.execute(query)
    daily_count = result.scalar_one()
    
    if daily_count >= settings.MAX_FILES_PER_DAY:
        raise HTTPException(
            status_code=429,
            detail=f"Daily upload limit reached ({settings.MAX_FILES_PER_DAY} files/day).",
        )

    # 4. Content Hash Deduplication
    content_hash = hashlib.sha256(file_content).hexdigest()
    
    # Check if user already uploaded this exact file
    existing_scan = await db.execute(
        select(UploadedFile).where(
            UploadedFile.user_id == current_user.id,
            UploadedFile.content_hash == content_hash
        )
    )
    existing_file = existing_scan.scalars().first()
    
    if existing_file:
        # Reuse existing file
        db_file = existing_file
    else:
        # 5. Upload to GCS
        try:
             upload_result = await storage_service.upload_file(
                 file_bytes=file_content,
                 filename=resume.filename,
                 content_type=resume.content_type or "application/octet-stream"
             )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

        # 6. Create DB Record
        db_file = UploadedFile(
            user_id=current_user.id,
            original_filename=resume.filename,
            content_type=resume.content_type or "application/octet-stream",
            size_bytes=file_size,
            bucket_path=upload_result["bucket_path"],
            public_url=None,
            content_hash=content_hash
        )
        try:
            db.add(db_file)
            await db.commit()
            await db.refresh(db_file)
        except IntegrityError:
            # Race condition: Another request inserted this hash just now.
            await db.rollback()
            existing_scan = await db.execute(
                select(UploadedFile).where(
                    UploadedFile.user_id == current_user.id,
                    UploadedFile.content_hash == content_hash
                )
            )
            db_file = existing_scan.scalars().first()
            if not db_file:
                raise HTTPException(status_code=500, detail="Database integrity error.")
    
    # 3. Create Async Job
    job = AIJob(
        user_id=current_user.id,
        job_type="resume_analysis",
        status=JobStatus.PENDING,
        input_ref=str(db_file.id)
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    
    # 4. Enqueue Job
    queue_service.enqueue_job({
        "job_id": str(job.id),
        "job_type": "resume_analysis",
        "input_ref": str(db_file.id)
    })
    
    # Return PENDING status immediately
    return {
        "id": job.id,
        "user_id": job.user_id,
        "job_type": job.job_type,
        "status": job.status,
        "created_at": job.created_at,
        "updated_at": job.updated_at
    }

@router.post("/match-jobs", response_model=AIJobOut)
@limiter.limit("5/minute")
async def match_jobs(
    request: Request,
    current_user: Annotated[User, Depends(deps.get_current_user)],
    resume_data: Dict[str, Any], # Accepts arbitrary resume JSON
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    Simulates AI Job Matching.
    """
    # Create Async Job
    job = AIJob(
        user_id=current_user.id,
        job_type="job_matching",
        status=JobStatus.PENDING,
        input_ref="resume_data_json" # Or store payload somewhere
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    
    # Enqueue
    queue_service.enqueue_job({
        "job_id": str(job.id),
        "job_type": "job_matching",
        "input_ref": "resume_data"
    })
    
    return {
        "id": job.id,
        "user_id": job.user_id,
        "job_type": job.job_type,
        "status": job.status,
        "created_at": job.created_at,
        "updated_at": job.updated_at
    }

@router.get("/jobs/{job_id}", response_model=AIJobOut)
async def get_job_status(
    job_id: uuid.UUID,
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    Poll job status.
    """
    result = await db.execute(select(AIJob).where(AIJob.id == job_id))
    job = result.scalars().first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if job.user_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized")
         
    return job
