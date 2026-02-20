from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from ...services.resume_tailor import resume_tailor_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Request Models
class JDAnalysisRequest(BaseModel):
    jd_text: str

class ResumeRewriteRequest(BaseModel):
    resume_text: str
    jd_analysis: Dict[str, Any]

# Response Models are dynamic JSON for now, matching the service output

@router.post("/analyze-jd")
async def analyze_job_description(request: JDAnalysisRequest):
    """
    Analyzes a Job Description to extract DNA (keywords, skills, tone).
    """
    try:
        if not request.jd_text or len(request.jd_text) < 50:
             raise HTTPException(status_code=400, detail="Job description too short.")
             
        result = await resume_tailor_service.analyze_job_description(request.jd_text)
        return result
    except Exception as e:
        logger.error(f"Error in analyze-jd: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tailor-resume")
async def tailor_resume(request: ResumeRewriteRequest):
    """
    Rewrites the resume based on the provided JD analysis.
    """
    try:
        if not request.resume_text or len(request.resume_text) < 50:
             raise HTTPException(status_code=400, detail="Resume text too short.")
             
        result = await resume_tailor_service.tailor_resume(request.resume_text, request.jd_analysis)
        return result
    except Exception as e:
        logger.error(f"Error in tailor-resume: {e}")
        raise HTTPException(status_code=500, detail=str(e))
