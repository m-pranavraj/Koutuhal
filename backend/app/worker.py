import asyncio
import time
import json
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from app.core.database import SessionLocal
from app.core.config import settings
from app.models.ai_job import AIJob, JobStatus
from app.services.ai_queue import queue_service

import logging
from app.core.logging import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

from app.services.llm.factory import get_llm_provider
from app.services.text_extractor import text_extractor
from app.services.storage import storage_service
from app.models.file import UploadedFile
from app.models.job import Job
from app.models.application import Application
from app.models.resume import Resume

async def process_resume_analysis(job: AIJob, db: AsyncSession) -> dict:
    """
    1. Fetch File path from DB (via input_ref = file_id)
    2. Download from GCS
    3. Extract Text
    4. Call LLM
    """
    file_id = uuid.UUID(job.input_ref)
    result = await db.execute(select(UploadedFile).where(UploadedFile.id == file_id))
    uploaded_file = result.scalars().first()
    
    if not uploaded_file:
        raise ValueError("Referenced file not found in DB")
        
    # Download
    file_bytes = await storage_service.download_file(uploaded_file.bucket_path)
    
    # Extract
    text = text_extractor.extract_text(file_bytes, uploaded_file.original_filename)
    
    # LLM
    llm = get_llm_provider()
    analysis = await llm.analyze_resume(text)
    
    # Extract usage if present
    usage = analysis.pop("_usage", 0)
    job.token_usage = usage
    job.provider = settings.LLM_PROVIDER
    
    return analysis

async def process_application_scoring(job: AIJob, db: AsyncSession) -> dict:
    JobModel = Job

    # 1. Fetch Application
    app_id = uuid.UUID(job.input_ref)
    result = await db.execute(select(Application).where(Application.id == app_id))
    application = result.scalars().first()
    if not application: raise ValueError("Application not found")

    # 2. Fetch Resume Text
    resume_result = await db.execute(select(Resume).where(Resume.id == application.resume_id))
    resume = resume_result.scalars().first()
    if not resume: raise ValueError("Resume not found")
    
    # We need the file for the resume. 
    # Resume model stores content in JSONB usually, but if it was uploaded file, we might need to fetch file.
    # Looking at Resume model: content: Mapped[Any] = mapped_column(JSONB, nullable=False)
    # If content is JSON, convert to string. If it refers to file, we'd go there.
    # For now, let's assume 'content' has the text or we stringify the JSON.
    resume_text = json.dumps(resume.content)

    # 3. Fetch Job Description
    job_result = await db.execute(select(JobModel).where(JobModel.id == application.job_id))
    target_job = job_result.scalars().first()
    if not target_job: raise ValueError("Job not found")
    
    jd_text = f"{target_job.title}\n{target_job.description}\n{target_job.skills}"

    # 4. LLM Match
    llm = get_llm_provider()
    # match_jobs expects list of jobs, but here we have 1 vs 1. 
    # We can reuse match_jobs or add analyze_fit.
    # reusing match_jobs: match_jobs(resume_text, [job_data])
    
    match_result = await llm.match_jobs(resume_text, [{"id": str(target_job.id), "title": target_job.title, "description": jd_text}])
    
    # match_result is typically a list of matches.
    # [{"id": "...", "score": 85, "reason": "..."}]
    
    if not match_result:
        score = 0
    else:
        score = match_result[0].get("score", 0)

    # 5. Update Application
    application.match_score = score
    # Simple rank estimation: 100 - score (just for demo logic, real rank involves comparing peers)
    application.rank = max(1, 101 - score) 
    application.processing_state = "scored"
    application.updated_at = func.now()
    
    db.add(application)
    # Commit happens in the main loop
    
    return {"score": score, "analysis": match_result}

async def process_job_matching(job: AIJob, db: AsyncSession) -> dict:
    # 1. Fetch File (resume)
    # This logic assumes input_ref points to a resume payload or ID.
    # For now, let's assume input_ref is "resume_text_hash" or we look up latest resume.
    # Simpler: input_ref is same as analyze_resume (file_id)
    
    # Fetch user's resume file? Or if input_ref is just "resume_data", we need the text.
    # Let's assume input_ref is a file_id for now for simplicity.
    if is_uuid(job.input_ref):
         file_id = uuid.UUID(job.input_ref)
         result = await db.execute(select(UploadedFile).where(UploadedFile.id == file_id))
         uploaded_file = result.scalars().first()
         if not uploaded_file: raise ValueError("Resume not found")
         file_bytes = await storage_service.download_file(uploaded_file.bucket_path)
         resume_text = text_extractor.extract_text(file_bytes, uploaded_file.original_filename)
    else:
        resume_text = "Placeholder resume text" 
        
    # Fetch Jobs
    jobs_result = await db.execute(select(Job).limit(20)) # Fetch 20 jobs
    jobs = jobs_result.scalars().all()
    jobs_data = [{"id": str(j.id), "title": j.title, "description": j.description} for j in jobs]
    
    llm = get_llm_provider()
    matches = await llm.match_jobs(resume_text, jobs_data)
    
    return {"matches": matches}

def is_uuid(val):
    try:
        uuid.UUID(str(val))
        return True
    except:
        return False

async def worker_loop():
    logger.info("Worker started. Listening for jobs...")
    while True:
        try:
            job_data = queue_service.dequeue_job()
            
            if job_data:
                job_id = job_data.get("job_id")
                job_type = job_data.get("job_type")
                input_ref = job_data.get("input_ref")
                
                logger.info(f"Picked Job {job_id} ({job_type})", extra={"job_id": job_id})
                
                async with SessionLocal() as db:
                    stmt = (
                        update(AIJob)
                        .where(AIJob.id == job_id)
                        .where(AIJob.status == JobStatus.PENDING)
                        .values(status=JobStatus.PROCESSING, version=AIJob.version + 1, started_at=func.now())
                        .execution_options(synchronize_session="fetch")
                    )
                    result = await db.execute(stmt)
                    await db.commit()
                    
                    if result.rowcount == 0:
                        continue
                        
                    # Fetch fresh job
                    job_result = await db.execute(select(AIJob).where(AIJob.id == job_id))
                    job = job_result.scalars().first()
                    
                    try:
                        start_time = time.time()
                        
                        if job_type == "resume_analysis":
                            result_data = await process_resume_analysis(job, db)
                        elif job_type == "application_scoring":
                            result_data = await process_application_scoring(job, db)
                        elif job_type == "job_matching":
                            result_data = await process_job_matching(job, db)
                        else:
                            raise ValueError("Unknown job type")
                        
                        duration = time.time() - start_time
                        
                        job.status = JobStatus.COMPLETED
                        job.result_json = result_data
                        job.version += 1
                        job.finished_at = func.now()
                        
                        logger.info(f"Job {job_id} Completed", extra={"job_id": job_id, "duration": duration})
                        
                    except Exception as e:
                        logger.error(f"Job Failed: {e}", exc_info=True, extra={"job_id": job_id})
                        job.status = JobStatus.FAILED
                        job.error = str(e)
                        job.version += 1
                        job.finished_at = func.now()
                        
                    await db.commit()
            
            await asyncio.sleep(0.1)
            
        except Exception as e:
            logger.error(f"Worker Error: {e}", exc_info=True)
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(worker_loop())
