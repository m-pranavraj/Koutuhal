from pydantic import BaseModel
from typing import List, Optional, Any
from app.schemas.job import JobOut

class ResumeAnalysisOut(BaseModel):
    score: int
    missingKeywords: List[str]
    foundKeywords: List[str]
    structureScore: int
    impactScore: int
    # Optional fields to satisfy potential future requirements or debugging
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    suggestions: Optional[List[str]] = None
    uploaded_file_id: Optional[str] = None # UUID string

class JobMatchOut(JobOut):
    match_score: int
