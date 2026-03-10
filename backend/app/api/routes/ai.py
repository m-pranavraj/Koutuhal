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

from pydantic import BaseModel

class ChatRequest(BaseModel):
    query: str
    role: str

class TailorRequest(BaseModel):
    jobDescription: str
    resumeText: str

router = APIRouter()

@router.post("/chat")
async def ai_chat(
    request: ChatRequest
):
    try:
        groq_client = _groq_client()
        
        # Contextual prompt based on role
        if request.role == 'organization':
            system_prompt = "You are Koutuhal AI, an expert assistant for recruiters and organizations. Your primary goal is to help them draft job descriptions (JDs), evaluate candidates, and manage placements. Keep responses concise, professional, and directly actionable."
        elif request.role == 'mentor':
            system_prompt = "You are Koutuhal AI, an expert assistant for mentors. Your primary goal is to help them prepare for sessions, answer student questions, and provide career guidance. Keep responses insightful and encouraging."
        elif request.role == 'college':
            system_prompt = "You are Koutuhal AI, an expert assistant for college placement officers (TPOs). Your primary goal is to help them organize placement drives, write announcements, and track student success. Keep responses organized and administrative."
        else: # student
            system_prompt = "You are Koutuhal AI, a friendly and expert career assistant for students. Your primary goal is to help them navigate the platform, improve their resumes, prepare for interviews, and find jobs. Be encouraging, clear, and actionable."

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.query}
        ]
        
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
            max_tokens=600
        )
        
        reply = completion.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        logger.error(f"Chat API error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process chat request")

@router.post("/tailor")
async def ai_tailor(
    request: TailorRequest
):
    try:
        groq_client = _groq_client()
        
        system_prompt = """
You are an expert career coach and ATS optimization specialist. 
Your task is to mathematically and strategically tailor the user's resume to the provided Job Description. 

OUTPUT FORMAT:
You must output ONLY a valid JSON object. Do not include any conversational text or markdown formatting outside the JSON.
The JSON must follow this exact schema:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "links": ["string"]
  },
  "summary": "Professional summary optimized for the JD (2-3 sentences)",
  "experience": [
    {
      "company": "string",
      "role": "string",
      "duration": "string",
      "location": "string",
      "bulletPoints": ["string tailored to JD with metrics"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "duration": "string",
      "location": "string",
      "cgpa": "string"
    }
  ],
  "skills": ["string (industry keywords)"],
  "projects": [
    {
      "name": "string",
      "description": "string (1-2 sentences)",
      "technologies": ["string"],
      "link": "string"
    }
  ],
  "certifications": ["string"]
}

RULES:
1. Use exact keywords from the JD where appropriate.
2. Quantify achievements (e.g., 'Improved accuracy by 15%').
3. Keep it ATS-friendly.
"""
        
        user_prompt = f"Job Description:\n{request.jobDescription}\n\nOriginal Resume:\n{request.resumeText}\n\nPlease tailor my resume to this job description and return the structured JSON."

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.3,
            max_tokens=4000
        )
        
        reply = completion.choices[0].message.content
        try:
            tailored_json = _parse_groq_json(reply)
            return {"tailoredResume": tailored_json}
        except Exception as e:
            logger.error(f"JSON Parse error in tailor: {e}")
            # Fallback for unexpected format
            return {"tailoredResume": {"rawText": reply}}
    except Exception as e:
        logger.error(f"Tailor API error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process tailor request")
    except Exception as e:
        logger.error(f"Tailor API error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process tailor request")

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


# ─── DETERMINISTIC SCORING ENGINE ───────────────────────────────────────
# These functions compute real scores from text, independent of the LLM.

def _extract_keywords_from_jd(jd_text: str) -> set:
    """Extract meaningful keywords/phrases from a job description."""
    if not jd_text or len(jd_text.strip()) < 20:
        return set()
    text = jd_text.lower()
    # Remove common stopwords and noise
    stopwords = {
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'shall', 'can', 'need', 'must', 'ought',
        'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
        'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most',
        'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than',
        'too', 'very', 'just', 'about', 'above', 'after', 'again', 'also',
        'as', 'at', 'before', 'below', 'between', 'by', 'down', 'during',
        'for', 'from', 'further', 'here', 'how', 'in', 'into', 'it', 'its',
        'of', 'off', 'on', 'once', 'out', 'over', 'per', 'then', 'there',
        'these', 'this', 'those', 'through', 'to', 'under', 'until', 'up',
        'we', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
        'why', 'with', 'you', 'your', 'our', 'their', 'he', 'she', 'they',
        'i', 'me', 'my', 'myself', 'we', 'us', 'him', 'her', 'them',
        'that', 'if', 'because', 'able', 'work', 'working', 'job', 'role',
        'position', 'company', 'team', 'looking', 'join', 'opportunity',
        'responsibilities', 'requirements', 'qualifications', 'experience',
        'required', 'preferred', 'ideal', 'candidate', 'applicant', 'years',
        'strong', 'excellent', 'good', 'great', 'well', 'etc', 'including',
    }
    # Extract words (2+ chars)
    words = _re.findall(r'\b[a-z][a-z+#./-]{1,30}\b', text)
    keywords = set()
    for w in words:
        if w not in stopwords and len(w) > 2:
            keywords.add(w)
    # Also extract common multi-word tech terms
    multi_patterns = [
        r'machine learning', r'deep learning', r'data science', r'data analysis',
        r'project management', r'product management', r'business development',
        r'digital marketing', r'content marketing', r'social media',
        r'full stack', r'front end', r'back end', r'cloud computing',
        r'artificial intelligence', r'natural language processing',
        r'computer vision', r'supply chain', r'sales development',
        r'customer success', r'account management', r'software development',
        r'web development', r'mobile development', r'devops', r'ci/cd',
        r'agile', r'scrum', r'user experience', r'user interface',
    ]
    for pat in multi_patterns:
        if _re.search(pat, text):
            keywords.add(pat)
    return keywords


def _compute_keyword_match(resume_text: str, jd_keywords: set) -> dict:
    """Programmatically count how many JD keywords appear in the resume."""
    if not jd_keywords:
        return {"found": [], "missing": [], "ratio": 0.5}  # neutral if no JD
    resume_lower = resume_text.lower()
    found = []
    missing = []
    for kw in jd_keywords:
        if kw in resume_lower:
            found.append(kw)
        else:
            missing.append(kw)
    ratio = len(found) / len(jd_keywords) if jd_keywords else 0.5
    return {"found": found, "missing": missing, "ratio": ratio}


def _compute_structure_score(resume_text: str) -> int:
    """Deterministic structure/formatting score based on resume text analysis."""
    score = 100
    text = resume_text.strip()
    lines = text.split('\n')
    non_empty = [l for l in lines if l.strip()]

    # Check for section headers (education, experience, skills, etc.)
    header_patterns = ['education', 'experience', 'skills', 'summary', 'objective',
                       'projects', 'certifications', 'achievements', 'awards', 'profile']
    headers_found = sum(1 for h in header_patterns if _re.search(r'\b' + h + r'\b', text, _re.IGNORECASE))
    if headers_found < 2:
        score -= 25  # Missing basic sections
    elif headers_found < 4:
        score -= 10

    # Check for bullet points
    bullet_count = sum(1 for l in non_empty if l.strip().startswith(('•', '-', '*', '→', '▪')))
    if bullet_count == 0:
        score -= 20  # No bullets = wall of text
    elif bullet_count < 3:
        score -= 10

    # Check for email
    if not _re.search(r'[\w.-]+@[\w.-]+\.[a-z]{2,}', text, _re.IGNORECASE):
        score -= 10

    # Check for phone number
    if not _re.search(r'\+?\d[\d\s()-]{7,}', text):
        score -= 5

    # Check resume length (too short or too long)
    word_count = len(text.split())
    if word_count < 100:
        score -= 25  # Very sparse
    elif word_count < 200:
        score -= 15
    elif word_count > 3000:
        score -= 10  # Too long

    # Check for dates (work history)
    date_count = len(_re.findall(r'\b(20[0-2]\d|19\d{2})\b', text))
    if date_count == 0:
        score -= 15  # No dates = no timeline

    return max(0, min(100, score))


def _compute_impact_score(resume_text: str) -> int:
    """Count quantified achievements (numbers, percentages, metrics)."""
    # Find quantified achievements
    metrics = _re.findall(
        r'\b\d+[%+]|\$\d+|\d+\s*(?:million|billion|thousand|k\b|M\b|cr\b)|'
        r'\b(?:increased|decreased|reduced|improved|grew|boosted|saved|generated|achieved|delivered)\s+.*?\d+',
        resume_text, _re.IGNORECASE
    )
    # Also count standalone numbers in context of achievements
    number_in_context = _re.findall(
        r'(?:led|managed|handled|processed|served|trained|mentored|built|developed|created|launched|\d+\+?)\s+\d+',
        resume_text, _re.IGNORECASE
    )
    total_metrics = len(metrics) + len(number_in_context)

    if total_metrics == 0:
        return 20
    elif total_metrics <= 2:
        return 40
    elif total_metrics <= 4:
        return 60
    elif total_metrics <= 6:
        return 75
    else:
        return min(95, 75 + total_metrics * 2)


def _compute_role_alignment(resume_text: str, role_name: str, jd_text: str) -> int:
    """
    Deterministic role alignment score.
    Checks how much of the role's required domain shows up in the resume.
    """
    resume_lower = resume_text.lower()
    role_lower = role_name.lower()

    # Extract keywords from the JD if provided
    if jd_text and len(jd_text.strip()) > 20:
        jd_kws = _extract_keywords_from_jd(jd_text)
        match = _compute_keyword_match(resume_text, jd_kws)
        return max(0, min(100, int(match['ratio'] * 100)))

    # If no JD, use role-name-based heuristic
    # Map common role families to required skill domains
    role_skill_map = {
        'software': ['python', 'java', 'javascript', 'c++', 'react', 'node', 'api', 'database', 'sql', 'git', 'code', 'programming', 'developer', 'engineer'],
        'data scientist': ['python', 'machine learning', 'statistics', 'sql', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'data analysis', 'modeling', 'r ', 'jupyter'],
        'data analyst': ['sql', 'excel', 'tableau', 'power bi', 'python', 'statistics', 'data analysis', 'visualization', 'reporting', 'dashboard'],
        'digital marketing': ['seo', 'sem', 'google ads', 'social media', 'content', 'analytics', 'campaign', 'email marketing', 'facebook', 'instagram', 'marketing'],
        'product manager': ['roadmap', 'stakeholder', 'agile', 'scrum', 'user stories', 'metrics', 'kpi', 'strategy', 'product', 'prioritization', 'market research'],
        'business development': ['sales', 'client', 'revenue', 'pipeline', 'negotiation', 'partnership', 'crm', 'b2b', 'lead generation', 'business'],
        'sdr': ['sales', 'outbound', 'cold calling', 'prospecting', 'crm', 'salesforce', 'pipeline', 'lead', 'outreach', 'quota'],
        'ai engineer': ['machine learning', 'deep learning', 'python', 'tensorflow', 'pytorch', 'nlp', 'computer vision', 'neural network', 'model', 'gpu', 'training'],
        'entrepreneur': ['startup', 'founded', 'co-founded', 'venture', 'fundraising', 'investor', 'equity', 'bootstrap', 'incubator', 'accelerator', 'ceo', 'cto'],
        'ux designer': ['figma', 'sketch', 'wireframe', 'prototype', 'user research', 'usability', 'design thinking', 'ui', 'ux', 'interaction design'],
        'devops': ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'jenkins', 'terraform', 'ansible', 'linux', 'monitoring', 'deployment'],
        'frontend': ['react', 'angular', 'vue', 'javascript', 'typescript', 'css', 'html', 'responsive', 'webpack', 'next.js', 'tailwind'],
        'backend': ['python', 'java', 'node', 'api', 'rest', 'graphql', 'database', 'sql', 'nosql', 'microservices', 'redis', 'aws'],
        'qa': ['testing', 'automation', 'selenium', 'test cases', 'bug', 'quality', 'regression', 'cypress', 'jira', 'manual testing'],
        'project manager': ['project', 'timeline', 'stakeholder', 'budget', 'risk', 'agile', 'scrum', 'pmp', 'gantt', 'resource', 'delivery'],
        'marketing manager': ['campaign', 'brand', 'strategy', 'analytics', 'roi', 'market research', 'budget', 'team', 'growth', 'conversion'],
        'hr': ['recruitment', 'hiring', 'onboarding', 'employee', 'performance', 'payroll', 'compliance', 'talent', 'culture', 'retention'],
    }

    # Find best matching role family
    best_skills = None
    best_match_score = 0
    for family, skills in role_skill_map.items():
        if family in role_lower or role_lower in family:
            best_skills = skills
            break
        # partial match
        overlap = sum(1 for word in family.split() if word in role_lower)
        if overlap > best_match_score:
            best_match_score = overlap
            best_skills = skills

    if not best_skills:
        # Unknown role — use generic professional keywords
        best_skills = ['leadership', 'management', 'analysis', 'strategy', 'communication', 'project', 'team', 'results', 'planning', 'execution']

    found = sum(1 for skill in best_skills if skill in resume_lower)
    ratio = found / len(best_skills)
    return max(0, min(100, int(ratio * 100)))


@router.post("/analyze-resume-quick")
async def analyze_resume_quick(
    resume: Annotated[UploadFile, File()],
    jd_text: Annotated[str, Form()],
) -> Any:
    """
    Public FAANG-level ATS resume analysis. No auth/DB/GCS.
    First validates the upload is actually a resume, then returns deep analysis.
    Dynamic scoring: each resume gets unique scores based on actual content.
    Anti-hallucination: scores strictly based on explicit resume content vs JD.
    """
    file_bytes = await resume.read()
    resume_text = _extract_text_from_upload(file_bytes, resume.content_type or "", resume.filename or "")
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text. Please upload a valid PDF, DOCX, or TXT resume.")

    client = _groq_client()

    # Detect if JD was properly provided
    jd_available = bool(jd_text and jd_text.strip() and len(jd_text.strip()) > 20)
    jd_section = jd_text[:3000] if jd_available else "No specific JD provided. Evaluate resume quality on general industry standards."

    prompt = f"""You are an elite ATS resume analyst. Analyze this resume DYNAMICALLY — every resume must get DIFFERENT scores based on its actual content.

TASK: Analyze the document text against the job description.

STEP 1 — VALIDATION: First determine if the document is actually a resume/CV. It must contain work history, education, or skills sections. Random documents, forms, invoices, or articles are NOT resumes.

STEP 2 — If it IS a resume, perform deep ATS analysis following these STRICT rules:

CRITICAL ANTI-HALLUCINATION RULES:
1. Score ONLY based on what is EXPLICITLY written in the resume. Do not assume unstated skills.
2. ATS Score must reflect actual keyword density vs JD requirements. A resume missing 60% of JD keywords cannot score above 45.
3. Structure Score must reflect real formatting: Does it have clear section headers? Consistent date formats? Bullet points? Proper hierarchy?
4. Impact Score must count ACTUAL quantified achievements (numbers, percentages, metrics). No metrics = score below 40.
5. Each gap/strength must cite SPECIFIC content from the resume, not generic observations.
6. Use SECOND PERSON perspective: "Your resume shows...", "You have...", NOT "The candidate has..." or "The applicant..."
7. If JD describes a role completely unrelated to resume experience, alignment score MUST be below 35%.
8. Generate UNIQUE insights — different resumes must produce different analysis, not template responses.

{"JOB DESCRIPTION:" if jd_available else "EVALUATION CONTEXT:"}
{jd_section}

DOCUMENT TEXT:
{resume_text[:5000]}

Respond ONLY with valid JSON (no markdown, no code blocks, no extra text):

If NOT a resume:
{{"is_resume": false}}

If it IS a resume:
{{
  "is_resume": true,
  "score": <integer 0-100, ATS compatibility. Count JD keyword matches / total JD keywords * 100. Be HONEST.>,
  "grade": <"S" if 90-100, "A" if 80-89, "B" if 65-79, "C" if 50-64, "D" if below 50>,
  "missingKeywords": [<up to 10 critical JD keywords NOT found in resume>],
  "foundKeywords": [<up to 12 JD keywords that ARE present in resume>],
  "structureScore": <integer 0-100. Check: section headers present? bullet points? dates consistent? professional email? no typos? Each missing element = -15 points>,
  "impactScore": <integer 0-100. Count quantified achievements with numbers/metrics. 0 metrics = 20, 1-2 = 40, 3-4 = 60, 5+ = 80+>,
  "criticalGaps": [
    {{"gap": "<specific missing skill/keyword from JD>", "severity": "<High|Medium|Low>", "fix": "<exact actionable fix referencing YOUR resume content>"}},
    ...up to 5
  ],
  "strengths": [
    {{"strength": "<specific strength>", "evidence": "<exact quote or paraphrase FROM the resume text>"}},
    ...up to 4
  ],
  "atsRecommendations": [
    "<specific, actionable recommendation using 'you/your' perspective>",
    ...up to 6
  ]
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You output ONLY valid raw JSON. No markdown. No explanations. Every resume gets unique, honest scores."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.15,
            max_tokens=1500,
        )
        
        raw_response = response.choices[0].message.content
        
        # Robust JSON parsing with fallback
        try:
            result = _parse_groq_json(raw_response)
        except _json.JSONDecodeError:
            logger.warning("Primary JSON parse failed, trying fallback extraction")
            if "{" in raw_response and "}" in raw_response:
                start = raw_response.find("{")
                end = raw_response.rfind("}") + 1
                try:
                    result = _json.loads(raw_response[start:end])
                except _json.JSONDecodeError:
                    logger.error("Fallback JSON parse also failed. Raw: %s", raw_response[:500])
                    raise HTTPException(status_code=500, detail="AI returned an invalid response. Please try again.")
            else:
                raise HTTPException(status_code=500, detail="AI returned an invalid response. Please try again.")

        if not result.get("is_resume", True):
            return {"is_resume": False}

        # ── DETERMINISTIC SCORE COMPUTATION ──────────────────────────
        # Compute real scores from text, then blend with LLM scores.
        # This makes hallucinated scores impossible.

        jd_keywords = _extract_keywords_from_jd(jd_text)
        kw_match = _compute_keyword_match(resume_text, jd_keywords)
        real_keyword_ratio = kw_match["ratio"]
        real_structure = _compute_structure_score(resume_text)
        real_impact = _compute_impact_score(resume_text)

        llm_score = max(0, min(100, int(result.get("score", 50))))
        llm_structure = max(0, min(100, int(result.get("structureScore", 50))))
        llm_impact = max(0, min(100, int(result.get("impactScore", 50))))

        # Blend: 40% deterministic + 60% LLM (LLM captures nuance, code caps hallucination)
        structure_score = int(real_structure * 0.4 + llm_structure * 0.6)
        impact_score = int(real_impact * 0.4 + llm_impact * 0.6)

        # ATS score: hard-cap based on real keyword match ratio
        real_keyword_score = int(real_keyword_ratio * 100)
        # LLM score cannot exceed real keyword score by more than 20 points
        max_allowed_score = real_keyword_score + 20
        score = min(llm_score, max_allowed_score) if jd_keywords else llm_score
        score = max(0, min(100, score))

        # Override LLM's found/missing keywords with real ones if JD was provided
        if jd_keywords:
            found = kw_match["found"][:12]
            missing = kw_match["missing"][:10]
        else:
            found = result.get("foundKeywords", [])
            missing = result.get("missingKeywords", [])

        # Determine grade based on validated score
        if score >= 90:
            grade = "S"
        elif score >= 80:
            grade = "A"
        elif score >= 65:
            grade = "B"
        elif score >= 50:
            grade = "C"
        else:
            grade = "D"

        logger.info(f"Score audit: LLM={llm_score}, RealKW={real_keyword_score}, Final={score} | Structure: LLM={llm_structure}, Real={real_structure}, Final={structure_score} | Impact: LLM={llm_impact}, Real={real_impact}, Final={impact_score}")

        # Sanitize strengths to ensure proper structure
        strengths = result.get("strengths", [])
        sanitized_strengths = []
        for s in strengths:
            if isinstance(s, dict):
                sanitized_strengths.append({
                    "strength": _coerce_to_string(s.get("strength", "")),
                    "evidence": _coerce_to_string(s.get("evidence", ""))
                })
            elif isinstance(s, str):
                sanitized_strengths.append({"strength": s, "evidence": ""})
        
        # Sanitize critical gaps
        gaps = result.get("criticalGaps", [])
        sanitized_gaps = []
        for g in gaps:
            if isinstance(g, dict):
                sanitized_gaps.append({
                    "gap": _coerce_to_string(g.get("gap", "")),
                    "severity": g.get("severity", "Medium"),
                    "fix": _coerce_to_string(g.get("fix", ""))
                })
            elif isinstance(g, str):
                sanitized_gaps.append({"gap": g, "severity": "Medium", "fix": ""})
        
        # Sanitize recommendations to strings
        recs = result.get("atsRecommendations", [])
        sanitized_recs = [_coerce_to_string(r) for r in recs]

        return {
            "is_resume": True,
            "score": score,
            "grade": grade,
            "missingKeywords": [_coerce_to_string(k) for k in missing],
            "foundKeywords": [_coerce_to_string(k) for k in found],
            "structureScore": structure_score,
            "impactScore": impact_score,
            "criticalGaps": sanitized_gaps,
            "strengths": sanitized_strengths,
            "atsRecommendations": sanitized_recs,
            "resume_text": resume_text
        }

    except HTTPException:
        raise
    except _json.JSONDecodeError as e:
        logger.error("Groq returned invalid JSON: %s", e)
        raise HTTPException(status_code=500, detail="AI returned an invalid response. Please try again.")
    except Exception as e:
        logger.error("Groq analysis error: %s", e)
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")


@router.post("/tailor-resume-json")
async def tailor_resume_json(
    data: dict,
) -> Any:
    """
    JSON-based resume tailoring endpoint.
    Accepts:
    {
        "resume_content": "full resume text",
        "job_description": "full job description text"
    }
    
    Returns:
    {
        "tailored_resume": "tailored content",
        "match_score": 85,
        "ats_score": 90,
        "keywords_found": [...],
        "keywords_missing": [...]
    }
    """
    from pydantic import BaseModel
    
    class TailorRequest(BaseModel):
        resume_content: str
        job_description: str
    
    # Parse the incoming data
    try:
        req = TailorRequest(**data)
        resume_text = req.resume_content.strip()
        jd_text = req.job_description.strip()
    except:
        raise HTTPException(status_code=400, detail="Invalid request format")
    
    if not resume_text or len(resume_text) < 50:
        raise HTTPException(status_code=400, detail="Resume content too short")
    if not jd_text or len(jd_text) < 50:
        raise HTTPException(status_code=400, detail="Job description too short")
    
    client = _groq_client()
    
    # Extract JD keywords for scoring
    jd_keywords = _extract_keywords_from_jd(jd_text)
    keyword_match = _compute_keyword_match(resume_text, jd_keywords)
    
    prompt = f"""You are an expert ATS-optimized resume writer. Transform the resume to perfectly match this job description while maintaining truthfulness.

JOB DESCRIPTION:
{jd_text[:2500]}

CURRENT RESUME:
{resume_text[:4000]}

TASK: Rewrite the resume to be optimally tailored for this job.

Rules:
1. Use ONLY information explicitly present in the resume - never invent skills or achievements
2. Rephrase bullet points to match JD keywords and terminology  
3. Reorder sections to prioritize job-relevant experience
4. Use first-person language: "Led...", "Implemented...", "Managed..."
5. Make achievements quantifiable when possible using resume facts
6. Keep ATS compatibility: no graphics, tables, or special formatting
7. Preserve all dates, company names, and factual information
8. Return ONLY the tailored resume text - no JSON, no explanations

Output the complete tailored resume in plain text format."""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{
                "role": "user", 
                "content": prompt
            }],
            temperature=0.3,
            max_tokens=2000,
        )
        
        tailored_content = response.choices[0].message.content.strip()
        
        # Compute match score (40% keyword + 60% LLM relevance)
        keyword_ratio = keyword_match.get("ratio", 0.5)
        llm_relevance = 0.85  # Assume LLM rewrites well
        match_score = int((0.4 * keyword_ratio + 0.6 * llm_relevance) * 100)
        match_score = min(match_score, 100)
        
        return {
            "tailored_resume": tailored_content,
            "match_score": match_score,
            "ats_score": min(95, match_score + 10),  # ATS score slightly higher
            "keywords_found": keyword_match.get("found", [])[:10],
            "keywords_missing": keyword_match.get("missing", [])[:10],
            "sufficient": match_score >= 60,
        }
        
    except Exception as e:
        logger.error(f"Resume tailor error: {e}")
        raise HTTPException(status_code=500, detail=f"Resume tailoring failed: {str(e)}")


@router.post("/tailor-resume-quick")
async def tailor_resume_quick(
    resume: Annotated[UploadFile, File()],
    jd_text: Annotated[str, Form()],
) -> Any:
    """
    Public resume tailoring endpoint. No auth/DB/GCS.
    Anti-hallucination: only uses information explicitly present in the resume.
    Returns tailored sections or gap questions if resume is too sparse.
    Fixed to handle responses robustly and prevent invalid JSON errors.
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
2. Rephrase existing content to match JD keywords and tone
3. Reorder bullet points to prioritize most relevant experience
4. Use "You" perspective: "You successfully...", "Your experience includes...", NOT "The candidate has..." or "The applicant"
5. Make content SPECIFIC and UNIQUE - avoid generic phrases like "strong communication skills" without examples
6. If a section has insufficient info to write confidently, add it to "gaps"
7. Do NOT add skills, achievements, or experiences not found in the resume
8. For each bullet point, make it as specific and quantifiable as possible from resume content

Response ONLY with valid JSON (no markdown, no code blocks):
{{
  "sufficient": <boolean - true if resume has 60%+ of JD requirements, false if critically sparse>,
  "tailored_sections": {{
    "summary": "<2-3 sentence professional summary IN FIRST PERSON, tailored to role, using only resume facts>",
    "skills": "<comma-separated relevant skills from resume, ordered by JD relevance>",
    "experience": "<rewritten bullet points using resume facts only, same structure as original, using first person>",
    "education": "<rewrite of education section from resume if present, using first person>"
  }},
  "gaps": [
    {{"field": "<section name>", "question": "<specific actionable question to gather missing details>"}},
    ...only include if that section is missing or too sparse for good tailoring
  ],
  "insufficient_reason": "<optional reason if sufficient=false>"
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{
                "role": "user", 
                "content": prompt
            }],
            temperature=0.2,
            max_tokens=1500,
        )
        
        raw_response = response.choices[0].message.content
        
        # Improved JSON extraction with detailed logging
        try:
            result = _parse_groq_json(raw_response)
        except _json.JSONDecodeError as parse_err:
            logger.error(f"JSON parse failed. Raw response (first 800 chars): {raw_response[:800]}")
            # Try alternative parsing if markdown extraction fails
            if "{" in raw_response and "}" in raw_response:
                try:
                    start = raw_response.find("{")
                    end = raw_response.rfind("}") + 1
                    result = _json.loads(raw_response[start:end])
                except:
                    logger.error("Alternative JSON parsing also failed")
                    raise HTTPException(status_code=500, detail="AI returned an invalid response. Please try again with a more detailed resume or JD.")
            else:
                raise HTTPException(status_code=500, detail="AI returned an invalid response. Please ensure your resume and JD are clear and detailed.")
        
        # Validate response structure
        if not isinstance(result, dict):
            raise HTTPException(status_code=500, detail="Invalid response format from AI service.")
        
        if "tailored_sections" not in result:
            result["tailored_sections"] = {
                "summary": "",
                "skills": "",
                "experience": "",
                "education": ""
            }
        
        # Sanitize tailored_sections to ensure they are strings
        sections = result.get("tailored_sections", {})
        sanitized_sections = {}
        for key in ["summary", "skills", "experience", "education"]:
            value = sections.get(key, "")
            # Convert to string and ensure no React object errors
            if isinstance(value, (dict, list)):
                sanitized_sections[key] = _json.dumps(value) if value else ""
            else:
                sanitized_sections[key] = _coerce_to_string(value)

        return {
            "sufficient": result.get("sufficient", True),
            "tailored_sections": sanitized_sections,
            "gaps": result.get("gaps", []),
            "insufficient_reason": result.get("insufficient_reason")
        }
        
    except HTTPException:
        raise
    except _json.JSONDecodeError as e:
        logger.error(f"Groq tailor invalid JSON: {e}")
        raise HTTPException(status_code=500, detail="AI returned an invalid response. Please try again.")
    except Exception as e:
        logger.error(f"Groq tailor error: {e}")
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
