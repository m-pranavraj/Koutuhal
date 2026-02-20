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

import io
import json as _json
import re as _re

def _extract_text_from_upload(file_bytes: bytes, content_type: str, filename: str) -> str:
    """Extract plain text from a PDF, DOCX, or TXT upload."""
    name_lower = filename.lower()
    try:
        if name_lower.endswith(".pdf") or "pdf" in (content_type or ""):
            import pdfplumber
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                return "\n".join(page.extract_text() or "" for page in pdf.pages)
        elif name_lower.endswith(".docx"):
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            return "\n".join(p.text for p in doc.paragraphs)
        else:
            return file_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        logger.warning("Text extraction error: %s", e)
        return file_bytes.decode("utf-8", errors="ignore")


import logging as _logging
logger = _logging.getLogger(__name__)




def _coerce_to_string(value: Any) -> str:
    """Recursively convert objects and lists into a readable string to avoid React 'object as child' errors."""
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, (int, float, bool)):
        return str(value)
    if isinstance(value, list):
        return "\n".join(_coerce_to_string(item) for item in value)
    if isinstance(value, dict):
        return "\n".join(f"{k}: {_coerce_to_string(v)}" for k, v in value.items())
    return str(value)


def _groq_client():
    from groq import Groq
    key = settings.GROQ_API_KEY if hasattr(settings, "GROQ_API_KEY") else ""
    if not key:
        raise HTTPException(status_code=503, detail="AI service not configured.")
    return Groq(api_key=key)

def _parse_groq_json(raw: str) -> dict:
    raw = raw.strip()
    raw = _re.sub(r"^```[a-z]*\n?", "", raw)
    raw = _re.sub(r"\n?```$", "", raw)
    return _json.loads(raw)


@router.post("/analyze-resume-quick")
async def analyze_resume_quick(
    resume: Annotated[UploadFile, File()],
    jd_text: Annotated[str, Form()],
) -> Any:
    """
    Public FAANG-level ATS resume analysis. No auth/DB/GCS.
    First validates the upload is actually a resume, then returns deep analysis.
    """
    file_bytes = await resume.read()
    resume_text = _extract_text_from_upload(file_bytes, resume.content_type or "", resume.filename or "")
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text. Please upload a valid PDF, DOCX, or TXT resume.")

    client = _groq_client()

    prompt = f"""You are an elite FAANG-level ATS resume analyst and career coach with 20 years of experience.

TASK: Analyze the document text against the job description.

STEP 1 — VALIDATION: First determine if the document is actually a resume/CV. It must contain professional work history, education, or skills sections. Random documents, forms, invoices, or articles are NOT resumes.

STEP 2 — If it IS a resume, perform deep ATS analysis.

JOB DESCRIPTION:
{jd_text[:3000]}

DOCUMENT TEXT:
{resume_text[:4000]}

Respond ONLY with a valid JSON object, no markdown, no extra text:

If NOT a resume:
{{"is_resume": false}}

If it IS a resume:
{{
  "is_resume": true,
  "score": <integer 0-100, honest ATS compatibility score>,
  "grade": <"S" if 90-100, "A" if 80-89, "B" if 65-79, "C" if 50-64, "D" if below 50>,
  "missingKeywords": [<up to 10 critical JD keywords absent from resume>],
  "foundKeywords": [<up to 12 important JD keywords present in resume>],
  "structureScore": <integer 0-100, formatting and structure quality>,
  "impactScore": <integer 0-100, use of metrics and quantified achievements>,
  "criticalGaps": [
    {{"gap": "<specific gap>", "severity": "<High|Medium|Low>", "fix": "<exact actionable fix>"}},
    ...up to 5
  ],
  "strengths": [
    {{"strength": "<specific strength found>", "evidence": "<quote or paraphrase from resume>"}},
    ...up to 4
  ],
  "atsRecommendations": [
    "<specific, actionable recommendation>",
    ...up to 6
  ]
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=1200,
        )
        result = _parse_groq_json(response.choices[0].message.content)

        if not result.get("is_resume", True):
            return {"is_resume": False}

        return {
            "is_resume": True,
            "score": int(result.get("score", 50)),
            "grade": result.get("grade", "C"),
            "missingKeywords": result.get("missingKeywords", []),
            "foundKeywords": result.get("foundKeywords", []),
            "structureScore": int(result.get("structureScore", 50)),
            "impactScore": int(result.get("impactScore", 50)),
            "criticalGaps": result.get("criticalGaps", []),
            "strengths": result.get("strengths", []),
            "atsRecommendations": result.get("atsRecommendations", []),
            "resume_text": resume_text
        }

    except _json.JSONDecodeError as e:
        logger.error("Groq returned invalid JSON: %s", e)
        raise HTTPException(status_code=500, detail="AI returned an invalid response. Please try again.")
    except Exception as e:
        logger.error("Groq analysis error: %s", e)
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")


@router.post("/tailor-resume-quick")
async def tailor_resume_quick(
    resume: Annotated[UploadFile, File()],
    jd_text: Annotated[str, Form()],
) -> Any:
    """
    Public resume tailoring endpoint. No auth/DB/GCS.
    Anti-hallucination: only uses information explicitly present in the resume.
    Returns tailored sections or gap questions if resume is too sparse.
    """
    file_bytes = await resume.read()
    resume_text = _extract_text_from_upload(file_bytes, resume.content_type or "", resume.filename or "")
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from resume.")

    client = _groq_client()

    prompt = f"""You are an expert resume writer. Your STRICT rule: you may ONLY use information explicitly stated in the resume text. Never invent, assume, or hallucinate any skill, company, role, achievement, date, or metric not present in the resume.

JOB DESCRIPTION:
{jd_text[:2500]}

CANDIDATE'S RESUME:
{resume_text[:4000]}

TASK: Rewrite the resume sections to be optimally tailored for this specific role.

Rules:
1. Use ONLY facts from the candidate's resume above
2. Rephrase existing content to match JD keywords
3. Reorder bullet points to prioritize most relevant experience
4. If a section has insufficient info to write confidently, add it to "gaps"
5. Do NOT add skills, achievements, or experiences not found in the resume

Respond ONLY with valid JSON, no markdown:
{{
  "sufficient": <true if resume has enough info to meaningfully tailor, false if critically sparse>,
  "tailored_sections": {{
    "summary": "<2-3 sentence professional summary tailored to the role, from resume info only>",
    "skills": "<comma-separated relevant skills from resume, ordered by JD relevance>",
    "experience": "<rewritten experience bullets, tailored language, same facts>",
    "education": "<education section from resume>"
  }},
  "gaps": [
    {{"field": "<section name>", "question": "<specific question to fill the gap>"}},
    ...only include if that section is missing or too sparse
  ]
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.15,
            max_tokens=1500,
        )
        result = _parse_groq_json(response.choices[0].message.content)
        
        # Sanitize tailored_sections to ensure they are strings
        sections = result.get("tailored_sections", {})
        sanitized_sections = {
            k: _coerce_to_string(sections.get(k, ""))
            for k in ["summary", "skills", "experience", "education"]
        }

        return {
            "sufficient": result.get("sufficient", True),
            "tailored_sections": sanitized_sections,
            "gaps": result.get("gaps", []),
        }
    except _json.JSONDecodeError as e:
        logger.error("Groq tailor invalid JSON: %s", e)
        raise HTTPException(status_code=500, detail="AI returned an invalid response.")
    except Exception as e:
        logger.error("Groq tailor error: %s", e)
        raise HTTPException(status_code=500, detail=f"Resume tailoring failed: {str(e)}")



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
