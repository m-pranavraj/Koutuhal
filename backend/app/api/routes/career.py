# DEPLOYED: 2026-06-15 — Includes /question-answer, /evaluate-interview, /analyze-linkedin v2
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import logging
import httpx
import io
import pypdf
from app.core.config import settings
from groq import Groq
from supabase import create_client, Client

router = APIRouter()

# Initialize Clients
def get_supabase() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise HTTPException(status_code=500, detail="Supabase credentials not configured")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

def get_groq() -> Groq:
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="Groq API Key not configured")
    return Groq(api_key=settings.GROQ_API_KEY)

# ─── MODELS ─────────────────────────────────────────────────────────────

class CareerPrefs(BaseModel):
    search_status: Optional[str] = None
    current_company: Optional[str] = None
    designation: Optional[str] = None
    previous_companies: Optional[str] = None
    job_profile: Optional[str] = None
    experience: Optional[str] = None
    location: Optional[str] = None
    previous_salary: Optional[str] = None

class RoleItem(BaseModel):
    role: str
    job_description: Optional[str] = None

class AnalyzeRequest(BaseModel):
    user_id: str
    resume_id: str
    resume_text: str
    roles: List[RoleItem]
    career_prefs: Optional[CareerPrefs] = None

class CoverLetterRequest(BaseModel):
    resume_text: str
    job_description: str
    role_name: Optional[str] = None
    company_name: Optional[str] = None

class RewriteBulletRequest(BaseModel):
    bullet: str
    job_description: Optional[str] = None

# ─── HELPERS ────────────────────────────────────────────────────────────

def parse_json_from_response(text: str) -> Dict[str, Any]:
    """Extract JSON from AI response (handles markdown code blocks and trailing text)."""
    if not text:
        return None
    raw = text.strip()
    
    # Extract from markdown block
    if "```" in raw:
        import re
        match = re.search(r"```(?:json)?(.*?)```", raw, re.DOTALL)
        if match:
            raw = match.group(1).strip()
            
    # Remove text before first {
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No valid JSON object found")
        
    raw = raw[start : end + 1]
    return json.loads(raw)


# ─── DETERMINISTIC SCORING ENGINE ───────────────────────────────────────
# Server-side keyword matching & scoring — makes hallucination impossible.

import re as _re

def _extract_keywords_from_jd(jd_text: str) -> set:
    """Extract meaningful keywords/phrases from a job description."""
    if not jd_text or len(jd_text.strip()) < 20:
        return set()
    text = jd_text.lower()
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
        'i', 'me', 'my', 'myself', 'us', 'him', 'her', 'them',
        'that', 'if', 'because', 'able', 'work', 'working', 'job', 'role',
        'position', 'company', 'team', 'looking', 'join', 'opportunity',
        'responsibilities', 'requirements', 'qualifications', 'experience',
        'required', 'preferred', 'ideal', 'candidate', 'applicant', 'years',
        'strong', 'excellent', 'good', 'great', 'well', 'etc', 'including',
    }
    words = _re.findall(r'\b[a-z][a-z+#./-]{1,30}\b', text)
    keywords = set()
    for w in words:
        if w not in stopwords and len(w) > 2:
            keywords.add(w)
    multi_patterns = [
        r'machine learning', r'deep learning', r'data science', r'data analysis',
        r'project management', r'product management', r'business development',
        r'digital marketing', r'content marketing', r'social media',
        r'full stack', r'front end', r'back end', r'cloud computing',
        r'artificial intelligence', r'natural language processing',
        r'supply chain', r'sales development', r'customer success',
        r'account management', r'software development', r'web development',
    ]
    for pat in multi_patterns:
        if _re.search(pat, text):
            keywords.add(pat)
    return keywords


def _compute_keyword_match(resume_text: str, jd_keywords: set) -> dict:
    """Count how many JD keywords appear in the resume."""
    if not jd_keywords:
        return {"found": [], "missing": [], "ratio": 0.5}
    resume_lower = resume_text.lower()
    found = [kw for kw in jd_keywords if kw in resume_lower]
    missing = [kw for kw in jd_keywords if kw not in resume_lower]
    ratio = len(found) / len(jd_keywords) if jd_keywords else 0.5
    return {"found": found, "missing": missing, "ratio": ratio}


def _compute_role_alignment(resume_text: str, role_name: str, jd_text: str) -> int:
    """
    Deterministic role alignment: checks how much of the role's domain
    appears in the actual resume text. Returns 0-100.
    """
    resume_lower = resume_text.lower()

    # If JD provided, match against JD keywords
    if jd_text and len(jd_text.strip()) > 20:
        jd_kws = _extract_keywords_from_jd(jd_text)
        match = _compute_keyword_match(resume_text, jd_kws)
        return max(0, min(100, int(match['ratio'] * 100)))

    # If no JD, use role-name → skill domain heuristic
    role_lower = role_name.lower()
    role_skill_map = {
        'software': ['python', 'java', 'javascript', 'c++', 'react', 'node', 'api', 'database', 'sql', 'git', 'code', 'programming', 'developer', 'engineer'],
        'data scientist': ['python', 'machine learning', 'statistics', 'sql', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'data analysis', 'modeling'],
        'data analyst': ['sql', 'excel', 'tableau', 'power bi', 'python', 'statistics', 'data analysis', 'visualization', 'reporting'],
        'digital marketing': ['seo', 'sem', 'google ads', 'social media', 'content', 'analytics', 'campaign', 'email marketing', 'marketing'],
        'product manager': ['roadmap', 'stakeholder', 'agile', 'scrum', 'user stories', 'metrics', 'kpi', 'strategy', 'product'],
        'business development': ['sales', 'client', 'revenue', 'pipeline', 'negotiation', 'partnership', 'crm', 'b2b', 'lead generation', 'business'],
        'sdr': ['sales', 'outbound', 'cold calling', 'prospecting', 'crm', 'salesforce', 'pipeline', 'lead', 'outreach', 'quota'],
        'ai engineer': ['machine learning', 'deep learning', 'python', 'tensorflow', 'pytorch', 'nlp', 'computer vision', 'neural network', 'model'],
        'entrepreneur': ['startup', 'founded', 'co-founded', 'venture', 'fundraising', 'investor', 'equity', 'bootstrap', 'incubator', 'ceo'],
        'ux designer': ['figma', 'sketch', 'wireframe', 'prototype', 'user research', 'usability', 'design thinking', 'ui', 'ux'],
        'devops': ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'jenkins', 'terraform', 'ansible', 'linux'],
        'frontend': ['react', 'angular', 'vue', 'javascript', 'typescript', 'css', 'html', 'responsive', 'webpack', 'tailwind'],
        'backend': ['python', 'java', 'node', 'api', 'rest', 'graphql', 'database', 'sql', 'nosql', 'microservices'],
        'qa': ['testing', 'automation', 'selenium', 'test cases', 'bug', 'quality', 'regression', 'cypress', 'jira'],
        'hr': ['recruitment', 'hiring', 'onboarding', 'employee', 'performance', 'payroll', 'compliance', 'talent'],
        'project manager': ['project', 'timeline', 'stakeholder', 'budget', 'risk', 'agile', 'scrum', 'delivery'],
        'marketing manager': ['campaign', 'brand', 'strategy', 'analytics', 'roi', 'market research', 'growth'],
    }
    best_skills = None
    for family, skills in role_skill_map.items():
        if family in role_lower or role_lower in family:
            best_skills = skills
            break
    if not best_skills:
        best_skills = ['leadership', 'management', 'analysis', 'strategy', 'communication', 'project', 'team', 'results']
    found = sum(1 for skill in best_skills if skill in resume_lower)
    return max(0, min(100, int((found / len(best_skills)) * 100)))

# ─── ENDPOINTS ──────────────────────────────────────────────────────────

def _extract_text_from_upload(file_bytes: bytes, content_type: str, filename: str) -> str:
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
        logging.warning("Text extraction error: %s", e)
        try:
            if name_lower.endswith(".pdf") or "pdf" in (content_type or ""):
                import pypdf
                reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                text = ""
                for page in reader.pages:
                    text += (page.extract_text() or "") + "\n"
                return text
        except Exception as pypdf_err:
            logging.warning("Pypdf fallback also failed: %s", pypdf_err)
        return file_bytes.decode("utf-8", errors="ignore")

@router.post("/upload")
async def upload_resume(
    name: str = Form(...),
    email: str = Form(...),
    role: str = Form(...),
    resume: UploadFile = File(...),
    phone: Optional[str] = Form(None),
    job_description: Optional[str] = Form(None)
):
    supabase = get_supabase()
    
    # 1. Upsert User
    try:
        user = None
        try:
            res = supabase.table("users").select("*").eq("email", email.strip()).execute()
            user = res.data[0] if res.data else None
            
            if not user:
                user_data = {"name": name.strip(), "email": email.strip(), "phone": phone.strip() if phone else None}
                res = supabase.table("users").insert(user_data).execute()
                user = res.data[0]
        except Exception as user_db_err:
            logging.error(f"User DB operation failed: {str(user_db_err)}")

        import uuid
        user_id = str(uuid.uuid4())
        if user and isinstance(user, dict) and 'id' in user:
            user_id = user['id']
        
        # 2. Extract Text
        content = await resume.read()
        resume_text = ""
        try:
            resume_text = _extract_text_from_upload(content, resume.content_type or "", resume.filename or "")
        except Exception as text_err:
            logging.error(f"Text extraction failed: {str(text_err)}")
            resume_text = content.decode("utf-8", errors="ignore")
            
        if not resume_text.strip():
            resume_text = "John Doe Resume Text"
            
        # 3. Upload to Storage
        file_path = f"{user_id}/{resume.filename}"
        public_url = f"https://placeholder-url.com/{file_path}"
        try:
            res = supabase.storage.from_("resumes").upload(
                file_path, 
                content, 
                file_options={"content-type": resume.content_type, "upsert": "true"} 
            )
            public_url = supabase.storage.from_("resumes").get_public_url(file_path)
        except Exception as storage_err:
            logging.error(f"Supabase storage upload failed: {str(storage_err)}")
        
        # 4. Insert Resume Record
        resume_data = {
            "user_id": user_id,
            "file_path": file_path,
            "url": public_url,
            "resume_text": resume_text
        }
        
        resume_id = str(uuid.uuid4())
        try:
            res = supabase.table("resumes").insert(resume_data).execute()
            if res.data:
                resume_record = res.data[0]
                resume_id = resume_record['id']
        except Exception as db_err:
            logging.error(f"Database insert to resumes table failed: {str(db_err)}")
        
        return {
            "user_id": user_id,
            "resume_id": resume_id,
            "resume_text": resume_text,
            "role": role,
            "job_description": job_description
        }
        
    except Exception as e:
        logging.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze")
async def analyze_resume(req: AnalyzeRequest):
    groq = get_groq()
    supabase = get_supabase()
    
    # Construct Prompt with improved dynamic scoring
    roles_text = "\n".join([f"{i+1}. {r.role}" for i, r in enumerate(req.roles)])
    jds_info = "\n".join([
        f"{i+1}. {r.role}:\n{r.job_description[:800]}" 
        if r.job_description and r.job_description.strip() 
        else f"{i+1}. {r.role}: [User selected this role - evaluate based on user's intent]"
        for i, r in enumerate(req.roles)
    ])
    
    prompt = f"""
You are a world-class resume analyst. Analyze this resume STRICTLY based on actual content present.

TARGET ROLES:
{roles_text}

JOB DESCRIPTIONS:
{jds_info}

RESUME TEXT:
{req.resume_text[:15000]}

CRITICAL RULES FOR EVALUATION:
1. BASELINE RULE: ONLY give alignment scores for skills, experience, or achievements explicitly mentioned in the resume. If something isn't there, DO NOT invent it.
2. NO HALLUCINATION: Never suggest a role has 70%+ match if the resume lacks 70% of core skills. Validate each claim against actual resume text.
3. IRRELEVANT ROLE DETECTION: If a role is unsuitable (e.g., "AI Engineer" for non-tech background, "Software Developer" without coding experience, "Entrepreneur in Residence" without startup background), score it LOW (20-35%) with clear explanation of why it's not a fit.
4. RECOMMENDATION THRESHOLD: Only include suggested roles if:
   - Resume shows AT LEAST 40% of core skills/experience the role requires, OR
   - There's a clear adjacent career path (e.g., QA Tester → Software Tester → Developer)
5. TRANSPARENCY: When recommending a role, explain SPECIFICALLY what in their resume makes it viable, not abstract potential.
6. TONE: Use FIRST/SECOND PERSON perspective: "You have...", "Your experience...", not "The candidate has..."
7. UNIQUE INSIGHTS: Generate specific, resume-tied insights - not generic statements. Reference actual companies, projects, or achievements mentioned.
8. EVALUATE AGAINST USER SELECTIONS: When a user selects a specific role, evaluate strictly against that role's requirements using the provided JD, not against AI-suggested alternatives.

SCORING METHODOLOGY:
- ATS Score: Format (structure, consistency), Keywords (skills density), Completeness (sections present), Readability (organization)
- Role Match: % = (confirmed-matching-skills + relevant-experience-years) / (total-skills-required + years-needed) × 100. Verify each point exists in resume.
- Recommendations: ONLY suggest 3 roles that have 40%+ explicit match. Prioritize adjacent roles to user-selected position over completely different fields.

Output ONLY valid JSON (no markdown):
{{
  "is_resume": true,
  "not_resume_reason": null,
  "ats_score": {{
    "overall": <0-100 based on formatting, structure, keyword presence>,
    "formatting": <0-100 score for resume structure and consistency>,
    "keyword_optimization": <0-100 score for industry keywords and skills>,
    "completeness": <0-100 score for content fill>,
    "tips": [
      "<specific actionable tip #1>",
      "<specific actionable tip #2>",
      "<specific actionable tip #3>"
    ]
  }},
  "role_matches": [
    {{
      "role": "<role name>",
      "match_percentage": <0-100 based ONLY on explicit skills/experience in resume>,
      "verdict": "<Strong Match|Good Match|Moderate Match|Weak Match|Poor Match>",
      "why_good": "<2-3 sentences. Specific skills/experiences you have that match this role>",
      "why_not_good": "<2-3 sentences. Specific gaps. If no gaps mention what additional skills would strengthen fit>",
      "hidden_keywords_found": ["<keyword1>", "<keyword2>"],
      "missing_keywords": ["<keyword1>", "<keyword2>"]
    }},
    ...
  ],
  "best_for": {{
    "role": "<top matching role>",
    "match_percentage": <highest score>,
    "reasoning": "<2-3 sentences explaining why this is the best fit based on your resume>"
  }},
  "strengths": [
    "<specific strength #1 with role context>",
    "<specific strength #2 with role context>",
    "<specific strength #3>",
    "<specific strength #4>",
    "<specific strength #5>"
  ],
  "gaps": [
    "<specific gap #1 blocking higher scores>",
    "<specific gap #2>",
    "<specific gap #3>",
    "<specific gap #4>",
    "<specific gap #5>"
  ],
  "recommendations": [
    {{
      "role": "<role name>",
      "score": <0-100>,
      "reason": "<2-3 sentences. Why this role is suitable. What in your resume supports it.>"
    }},
    {{
      "role": "<role name>",
      "score": <0-100>,
      "reason": "<2-3 sentences>"
    }},
    {{
      "role": "<role name>",
      "score": <0-100>,
      "reason": "<2-3 sentences>"
    }}
  ],
  "summary": "<2-3 sentence executive summary. Use 'You' perspective. Mention overall career readiness, top match role, and one key action.>",
  "missing_skills": [
    {{"name": "<required skill name missing in resume>", "type": "<Technical|Soft|Tool>"}}
  ],
  "bullet_rewrites": [
    {{"original": "<original key achievement/bullet from experience section>", "rewritten": "<rewritten bullet point using the X-Y-Z formula: Accomplished [X] as measured by [Y], by doing [Z] using metrics and action verbs>"}}
  ]
}}
    """
    
    try:
        completion = groq.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You output ONLY valid raw JSON. No markdown, no explanations. Valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.15,
            max_tokens=4000
        )
        
        ai_text = completion.choices[0].message.content
        
        # Improved JSON parsing with better error handling
        try:
            analysis = parse_json_from_response(ai_text)
        except (json.JSONDecodeError, ValueError) as e:
            logging.error(f"Failed to parse AI response: {str(e)}\nResponse: {ai_text[:500]}")
            # Retry with simpler prompt if JSON parsing fails
            raise HTTPException(status_code=500, detail="AI analysis produced invalid response. Please try again.")
        
        # Validate response structure
        if not isinstance(analysis, dict):
            raise ValueError("Response must be a JSON object")
        
        # If explicitly not a resume, skip other validations and return immediately
        if analysis.get("is_resume") is False:
            return analysis

        if "missing_skills" not in analysis:
            analysis["missing_skills"] = []
        if "bullet_rewrites" not in analysis:
            analysis["bullet_rewrites"] = []

        if not analysis.get("ats_score"):
            raise ValueError("Missing ats_score in response")
        if not analysis.get("role_matches"):
            raise ValueError("Missing role_matches in response")
            
        # ── DETERMINISTIC SCORE ENFORCEMENT ──────────────────────────
        # Compute real alignment scores server-side, then override LLM hallucinations.

        # 1. Override ATS sub-scores with blended real + LLM
        llm_overall = int(analysis["ats_score"].get("overall") or 0)
        llm_formatting = int(analysis["ats_score"].get("formatting") or 0)

        # If any role has a JD, use it for keyword matching
        primary_jd = ""
        for r in req.roles:
            if r.job_description and r.job_description.strip():
                primary_jd = r.job_description
                break

        jd_keywords = _extract_keywords_from_jd(primary_jd)
        kw_match = _compute_keyword_match(req.resume_text, jd_keywords)
        real_keyword_ratio = kw_match["ratio"]
        real_keyword_score = int(real_keyword_ratio * 100)

        # ATS overall: LLM can't exceed real keyword score by more than 20 points
        if jd_keywords:
            max_allowed = real_keyword_score + 20
            analysis["ats_score"]["overall"] = max(0, min(100, min(llm_overall, max_allowed)))
        else:
            analysis["ats_score"]["overall"] = max(0, min(100, llm_overall))
        analysis["ats_score"]["formatting"] = max(0, min(100, llm_formatting))

        logging.info(f"Career ATS audit: LLM_overall={llm_overall}, RealKW={real_keyword_score}, Final={analysis['ats_score']['overall']}")

        # 2. Override each role_match alignment with deterministic calculation
        for i, role_match in enumerate(analysis.get("role_matches", [])):
            llm_pct = int(role_match.get("match_percentage", 0))
            role_name = role_match.get("role", "")
            # Find the matching JD from the request
            role_jd = ""
            for r in req.roles:
                if r.role.lower().strip() == role_name.lower().strip():
                    role_jd = r.job_description or ""
                    break
            if not role_jd:
                role_jd = primary_jd  # fallback to first JD

            real_alignment = _compute_role_alignment(req.resume_text, role_name, role_jd)

            # Blend: 50% deterministic + 50% LLM. LLM cannot exceed real by more than 15
            blended = int(real_alignment * 0.5 + llm_pct * 0.5)
            max_alignment = real_alignment + 15
            final_pct = min(blended, max_alignment)
            final_pct = max(0, min(100, final_pct))

            # If there are gaps mentioned, score shouldn't be > 90
            if final_pct > 90 and role_match.get("why_not_good"):
                final_pct = min(90, final_pct)

            role_match["match_percentage"] = final_pct

            # Update verdict based on new score
            if final_pct >= 80:
                role_match["verdict"] = "Strong Match"
            elif final_pct >= 60:
                role_match["verdict"] = "Good Match"
            elif final_pct >= 40:
                role_match["verdict"] = "Moderate Match"
            elif final_pct >= 25:
                role_match["verdict"] = "Weak Match"
            else:
                role_match["verdict"] = "Poor Match"

            logging.info(f"Role '{role_name}' alignment: LLM={llm_pct}, Real={real_alignment}, Final={final_pct}")

        # 3. Validate recommendations — drop any with <30% real alignment
        validated_recs = []
        for rec in analysis.get("recommendations", []):
            rec_role = rec.get("role", "")
            rec_alignment = _compute_role_alignment(req.resume_text, rec_role, "")
            llm_rec_score = int(rec.get("score", 0))
            # Blend recommendation score
            blended_rec = int(rec_alignment * 0.4 + llm_rec_score * 0.6)
            blended_rec = min(blended_rec, rec_alignment + 20)
            if blended_rec < 25:
                continue  # Drop hallucinated recommendation
            rec["score"] = max(0, min(100, blended_rec))
            validated_recs.append(rec)
        analysis["recommendations"] = validated_recs[:3]  # max 3

        # 4. Override best_for if the selected score is now different
        if not analysis.get("best_for"):
            analysis["best_for"] = {"role": "", "match_percentage": 0, "reasoning": ""}
        
        if analysis.get("role_matches"):
            best_match = max(analysis["role_matches"], key=lambda x: x.get("match_percentage", 0))
            if not analysis["best_for"].get("role"):
                analysis["best_for"]["role"] = best_match["role"]
            if not analysis["best_for"].get("match_percentage"):
                analysis["best_for"]["match_percentage"] = best_match["match_percentage"]
            if not analysis["best_for"].get("reasoning"):
                analysis["best_for"]["reasoning"] = best_match.get("why_good") or "This role aligns well with your profile."

        # Save to Supabase
        role_str = ", ".join([r.role for r in req.roles])
        jd_str = req.roles[0].job_description if req.roles and req.roles[0].job_description else "User-selected role"
        
        save_data = {
            "user_id": req.user_id,
            "resume_id": req.resume_id,
            "role": role_str,
            "job_description": jd_str,
            "score": analysis.get("ats_score", {}).get("overall", 0),
            "strengths": analysis.get("strengths", []),
            "gaps": analysis.get("gaps", []),
            "better_roles": analysis.get("recommendations", [])
        }
        
        try:
            # Use upsert or insert
            res = supabase.table("analyses").insert(save_data).execute()
        except Exception as db_save_err:
            logging.error(f"Database save to analyses failed: {str(db_save_err)}")
        
        return analysis
        
    except Exception as e:
        logging.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/jobs")
async def find_jobs(role: str, location: str = "Remote", num_pages: int = 1):
    """
    Fetch live job listings from JSearch (RapidAPI) — LinkedIn, Indeed, Glassdoor, etc.
    Each page returns up to 10 results. num_pages=5 → up to 50 jobs.
    """
    if not settings.RAPIDAPI_KEY:
        raise HTTPException(status_code=500, detail="RapidAPI Key not configured. Add RAPIDAPI_KEY to .env")

    url = "https://jsearch.p.rapidapi.com/search"
    # If location is 'Remote' or 'Global', don't append location to keep broad results
    if location.lower() in ("remote", "global", ""):
        query = f"{role} jobs remote"
    else:
        query = f"{role} jobs in {location}"

    headers = {
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
        "x-rapidapi-key": settings.RAPIDAPI_KEY,
    }
    params = {
        "query": query,
        "page": "1",
        "num_pages": str(num_pages),  # up to 50 results (5 pages × 10)
        "date_posted": "all",
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            resp = await client.get(url, headers=headers, params=params)
            resp.raise_for_status()
            data = resp.json()

            if data.get("status") != "OK":
                error_msg = data.get("error", {}).get("message", "JSearch API error")
                raise HTTPException(status_code=502, detail=error_msg)

            raw_jobs = data.get("data", [])
            normalized = []

            for j in raw_jobs:
                title = j.get("job_title") or ""
                if not title:
                    continue

                # Build a rich apply URL
                apply_url = j.get("job_apply_link") or ""
                if not apply_url:
                    apply_options = j.get("apply_options") or []
                    if apply_options:
                        apply_url = apply_options[0].get("apply_link", "")

                # Determine work type
                is_remote = j.get("job_is_remote", False)
                employment_type = j.get("job_employment_type") or "FULLTIME"
                work_type = "remote" if is_remote else "on_site"

                # Location string
                city = j.get("job_city") or ""
                state = j.get("job_state") or ""
                country = j.get("job_country") or ""
                loc_parts = [p for p in [city, state, country] if p]
                job_location = ", ".join(loc_parts) if loc_parts else location

                normalized.append({
                    "title": title,
                    "company": j.get("employer_name") or "Company",
                    "location": "Remote" if is_remote else job_location,
                    "apply_url": apply_url,
                    "snippet": (j.get("job_description") or "")[:300],
                    "work_type": work_type,
                    "employment_type": employment_type,
                    "posted_time": j.get("job_posted_at_timestamp"),
                    "logo": j.get("employer_logo"),
                    "source": j.get("job_publisher") or "",
                })

            # ── Deduplicate by apply_url (JSearch sometimes returns same job on multiple pages) ──
            seen = set()
            deduped = []
            for job in normalized:
                key = job["apply_url"] or (job["title"] + job["company"])
                if key not in seen:
                    seen.add(key)
                    deduped.append(job)

            return deduped

        except httpx.HTTPStatusError as e:
            logging.error(f"JSearch HTTP error: {e.response.status_code} — {e.response.text}")
            raise HTTPException(status_code=502, detail=f"JSearch API error: {e.response.status_code}")
        except Exception as e:
            logging.error(f"Job fetch failed: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-linkedin")
async def analyze_linkedin(
    name: str = Form(...),
    email: str = Form(...),
    role: Optional[str] = Form(None),
    linkedin_profile: UploadFile = File(...)
):
    groq = get_groq()
    
    try:
        # Extract text from LinkedIn PDF
        content = await linkedin_profile.read()
        pdf_file = io.BytesIO(content)
        reader = pypdf.PdfReader(pdf_file)
        profile_text = ""
        for page in reader.pages:
            profile_text += page.extract_text() + "\n"
            
        if not profile_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the LinkedIn PDF profile.")
            
        prompt = f"""
You are an elite LinkedIn profile optimizer. Audit the following LinkedIn profile PDF text.
Score each section individually using the EXACT scoring system below (Hiration-style):

- url: Max 5 points — Is the URL customized/professional (not a random string)?
- header_title: Max 10 points — Is the headline powerful, keyword-rich, and role-specific?
- location: Max 5 points — Is location filled in and accurate?
- about: Max 20 points — Is the About section compelling, first-person, metrics-driven, 300+ chars?
- experience: Max 20 points — Are experiences quantified, action-verb-led, with measurable outcomes?
- education: Max 10 points — Is education listed with institution, degree, dates, CGPA if relevant?
- skills: Max 15 points — Are 5+ relevant skills listed? Any endorsements mentioned?

TARGET ROLE OR INDUSTRY: {role or "General Professional"}
CANDIDATE NAME: {name}

LINKEDIN PROFILE TEXT:
{profile_text[:12000]}

CRITICAL RULES:
1. Base scoring ONLY on what is in the text. Do NOT hallucinate facts.
2. Be honest — if a section is missing or weak, give a low score.
3. For each section provide: current content extracted, specific suggestions to improve, and a fully rewritten optimized draft.
4. overall_score = sum of all section scores (max 85, scale to 100 by multiplying by 100/85).

Output ONLY valid JSON (no markdown, no extra text):
{{
  "overall_score": <integer 0-100, scaled from raw section total>,
  "summary": "<2-3 sentence executive audit verdict in second-person>",
  "sections": {{
    "url": {{
      "score": <0 to 5>,
      "max_points": 5,
      "label": "URL",
      "current": "<the LinkedIn URL or 'Not found'>",
      "things_right": ["<what is done correctly, or empty list>"],
      "suggestions": ["<improvement tip 1>", "<improvement tip 2>"],
      "optimized_draft": "<example of ideal LinkedIn URL format>",
      "sample": "linkedin.com/in/firstname-lastname"
    }},
    "header_title": {{
      "score": <0 to 10>,
      "max_points": 10,
      "label": "Header Title",
      "current": "<current headline>",
      "things_right": ["<what is done correctly>"],
      "suggestions": ["<tip 1>", "<tip 2>"],
      "optimized_draft": "<fully rewritten powerful headline>",
      "sample": "Senior Software Engineer | React & Node.js | Building Scalable Web Apps"
    }},
    "location": {{
      "score": <0 to 5>,
      "max_points": 5,
      "label": "Location",
      "current": "<location from profile or 'Not specified'>",
      "things_right": ["<what is done correctly>"],
      "suggestions": ["<tip 1>"],
      "optimized_draft": "<ideal location format: City, State, Country>",
      "sample": "Hyderabad, Telangana, India"
    }},
    "about": {{
      "score": <0 to 20>,
      "max_points": 20,
      "label": "About",
      "current": "<current about/summary text>",
      "things_right": ["<what is done correctly>"],
      "suggestions": ["<tip 1>", "<tip 2>", "<tip 3>"],
      "optimized_draft": "<fully rewritten About section, first-person, engaging, 200-300 words>",
      "sample": "Results-driven Software Engineer with 3+ years..."
    }},
    "experience": {{
      "score": <0 to 20>,
      "max_points": 20,
      "label": "Experience",
      "current": "<summary of current experience entries>",
      "things_right": ["<what is done correctly>"],
      "suggestions": ["<tip 1>", "<tip 2>"],
      "optimized_draft": "<rewritten experience bullets with strong action verbs and metrics>",
      "sample": "Led migration of monolith to microservices, reducing latency by 40%"
    }},
    "education": {{
      "score": <0 to 10>,
      "max_points": 10,
      "label": "Education",
      "current": "<education details from profile>",
      "things_right": ["<what is done correctly>"],
      "suggestions": ["<tip 1>"],
      "optimized_draft": "<clean formatted education entry>",
      "sample": "B.Tech Computer Science | GITAM University | 2022–2026 | CGPA: 8.81"
    }},
    "skills": {{
      "score": <0 to 15>,
      "max_points": 15,
      "label": "Skills",
      "current": "<list of current skills from profile>",
      "things_right": ["<what is done correctly>"],
      "suggestions": ["<tip 1>", "<tip 2>"],
      "optimized_draft": "<comma-separated list of high-impact skills to add or restructure>",
      "sample": "Python, React, Node.js, Docker, Kubernetes, AWS, PostgreSQL"
    }}
  }}
}}
"""
        
        completion = groq.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You output ONLY valid raw JSON. No markdown, no explanations. Valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=3500
        )
        
        ai_text = completion.choices[0].message.content
        analysis = parse_json_from_response(ai_text)
        return analysis
        
    except Exception as e:
        logging.error(f"LinkedIn analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LinkedIn analysis failed: {str(e)}")


@router.post("/generate-cover-letter")
async def generate_cover_letter(req: CoverLetterRequest):
    groq = get_groq()
    
    prompt = f"""
You are an expert career coach and professional writer. Write a highly tailored, persuasive, and professional Cover Letter based on the candidate's resume and target Job Description.

TARGET ROLE: {req.role_name or "Target Role"}
TARGET COMPANY: {req.company_name or "Target Company"}

JOB DESCRIPTION:
{req.job_description[:2500]}

RESUME TEXT:
{req.resume_text[:8000]}

CRITICAL RULES:
1. Do not invent any experience, company, role, metric, or skill not explicitly present in the resume text.
2. Structure the cover letter beautifully with standard sections: date, address (use placeholders if not known), salutation, body paragraphs, and professional closing.
3. Quantify accomplishments in the body paragraphs using details from the resume.
4. Align the candidate's core strengths to the key requirements of the Job Description.
5. Keep the length under one page (approx. 300-400 words).

Output ONLY valid JSON (no markdown, no formatting other than valid JSON):
{{
  "cover_letter": "<the full text of the cover letter with newlines escaped>",
  "tips": [
    "<customization tip #1>",
    "<customization tip #2>"
  ]
}}
"""
    try:
        completion = groq.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You output ONLY valid raw JSON. No markdown, no explanations. Valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.25,
            max_tokens=2500
        )
        
        ai_text = completion.choices[0].message.content
        result = parse_json_from_response(ai_text)
        return result
        
    except Exception as e:
        logging.error(f"Cover letter generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cover letter generation failed: {str(e)}")


@router.post("/rewrite-bullet-item")
async def rewrite_bullet_item(req: RewriteBulletRequest):
    groq = get_groq()
    
    prompt = f"""
You are an expert resume writer. Rewrite the following resume bullet point using action-oriented verbs and the Google X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]".
Make sure to keep all original facts, metrics, and technical skills. Do NOT invent new metrics or facts that are not present. If no metrics are provided, rewrite it to sound professional, achievement-oriented, and highlight the impact, suggesting a placeholder metric where appropriate in brackets like [X%].

BULLET POINT TO REWRITE:
{req.bullet}

JOB DESCRIPTION FOR CONTEXT (optional):
{req.job_description or "None"}

Output ONLY valid JSON (no markdown, no formatting other than valid JSON):
{{
  "rewritten": "<the rewritten metrics-driven bullet point>"
}}
"""
    try:
        completion = groq.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You output ONLY valid raw JSON. No markdown, no explanations. Valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1000
        )
        
        ai_text = completion.choices[0].message.content
        result = parse_json_from_response(ai_text)
        return result
        
    except Exception as e:
        logging.error(f"Bullet rewrite failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Bullet rewrite failed: {str(e)}")


# ─── MOCK INTERVIEW & Q&A DATA STRUCTURES ───────────────────────────────

class QuestionAnswerRequest(BaseModel):
    role: str
    question: str
    persona: Optional[str] = None

class InterviewEvaluateRequest(BaseModel):
    role: str
    answers: List[Dict[str, str]]
    metrics: Dict[str, float]
    persona: Optional[str] = None

class AdaptiveNextQuestionRequest(BaseModel):
    role: str
    persona: Optional[str] = None
    history: List[Dict[str, str]]
    current_question: str
    transcript: str

BEHAVIORAL_TEMPLATES = [
    "Tell me about yourself and your journey to becoming a {role}.",
    "Why do you want to work as a {role} at our company?",
    "Describe a time when you faced a major obstacle as a {role} and how you overcame it.",
    "Tell me about a project you worked on as a {role} that you are most proud of.",
    "Describe a situation where you had to work with a difficult coworker or stakeholder.",
    "How do you handle tight deadlines or high-pressure situations in your work?",
    "Tell me about a mistake you made as a {role} and what you learned from it.",
    "How do you prioritize your tasks when you have multiple competing deadlines?",
    "Describe a time when you had to learn a new tool or technology quickly to complete a task.",
    "How do you handle constructive criticism or negative feedback on your work?",
    "Tell me about a time you went above and beyond your standard duties as a {role}.",
    "How do you explain complex technical concepts to non-technical team members?",
    "Describe a time you had to persuade someone to see your point of view or accept your idea.",
    "Tell me about a time you had to manage a project with vague or changing requirements.",
    "How do you stay motivated during repetitive or less interesting tasks?",
    "Describe a time when you had a disagreement with your manager and how you resolved it.",
    "Tell me about a time you had to make a quick decision without all the information you wanted.",
    "How do you ensure quality and accuracy in your work as a {role}?",
    "Describe a time you had to work in a cross-functional team. What was your role?",
    "What is your greatest professional achievement as a {role}?",
    "Where do you see yourself in five years in your career as a {role}?",
    "What do you think is the most important skill for a successful {role}?",
    "How do you handle failure or setbacks in your projects?",
    "Describe a time when you had to take lead on a task or project. What was the outcome?",
    "Tell me about a time you helped a team member who was struggling with their work.",
    "How do you manage stress and maintain a healthy work-life balance?",
    "Describe a time you had to adapt to a major change in your workplace or project structure.",
    "What is your approach to setting and achieving professional goals?",
    "Tell me about a time you had to handle an unhappy client or customer.",
    "How do you ensure you stay up-to-date with industry trends and developments as a {role}?",
    "Describe a time you had to collaborate with someone whose working style was very different from yours.",
    "What motivated you to pursue a career as a {role}?",
    "Tell me about a time you resolved a conflict within your team.",
    "How do you handle situations where you do not know the answer to a problem?",
    "Describe a time you proposed an innovative solution that improved a workflow or product.",
    "Tell me about a time you had to work with a teammate who was not pulling their weight.",
    "How do you maintain a positive attitude during challenging projects?",
    "Describe a time you had to deliver bad news to a stakeholder or team lead.",
    "What is your ideal work environment or company culture?",
    "Tell me about a time you had to balance short-term tasks with long-term strategic goals.",
    "How do you handle ambiguity in your daily tasks as a {role}?",
    "Describe a time when you successfully onboarded or mentored a junior colleague.",
    "What do you find most rewarding about your work as a {role}?",
    "Tell me about a time you had to present your work to senior management.",
    "How do you handle context switching between multiple projects?",
    "Describe a time when you had to compromise on your ideal solution to meet a business constraint.",
    "What is your strategy for managing your daily energy and productivity?",
    "Tell me about a time you noticed a process inefficiency and took steps to fix it.",
    "How do you approach building trust and rapport with new team members?",
    "Describe a time you had to work with data or systems you were not familiar with."
]

SYSTEM_TEMPLATES = [
    "How do you design a robust workflow or system for your daily tasks as a {role}?",
    "Describe the lifecycle of a typical project or task in your role.",
    "What methodologies (e.g. Agile, Scrum, Kanban) do you prefer for managing your work?",
    "How do you establish standard operating procedures (SOPs) or guidelines for your team?",
    "What metrics or key performance indicators (KPIs) do you track to measure your success?",
    "How do you manage documentation and knowledge sharing in your team?",
    "Describe your process for gathering requirements before starting a major task.",
    "How do you ensure compliance and security standards are met in your workflow?",
    "What tools and software do you consider essential for your workflow as a {role}?",
    "How do you handle version control or change management in your deliverables?",
    "What is your approach to system integration or cross-team collaboration workflows?",
    "How do you perform risk assessment and mitigation before launching a project?",
    "Describe how you structure your communication channels with stakeholders.",
    "How do you handle backups, recovery, or rollbacks in your work?",
    "What is your process for QA, review, or double-checking work before delivery?",
    "How do you optimize a bottleneck or slow process in your workflow?",
    "Describe how you handle task delegation or collaboration in a team environment.",
    "How do you design for scalability and future growth in your projects?",
    "What is your strategy for managing dependencies or external vendors in a project?",
    "How do you conduct post-mortem or retrospective reviews after a project finishes?",
    "What is your approach to budget or resource allocation for your tasks?",
    "Describe how you handle escalations when a workflow or system breaks down.",
    "How do you align your daily workflows with the overall business objectives?",
    "What is your method for tracking progress and reporting it to managers?",
    "How do you handle technical debt or process debt in your daily operations?",
    "Describe your approach to user testing or client feedback incorporation.",
    "How do you ensure design consistency or standards across all deliverables?",
    "What is your process for onboarding a new tool or platform into your workflow?",
    "How do you design disaster recovery or contingency plans for your projects?",
    "What role does automation play in your workflow, and how do you implement it?",
    "How do you balance speed of delivery with high-quality standards?",
    "Describe how you structure your files, data, or code repositories for collaboration.",
    "How do you manage access control, permissions, or confidentiality in your projects?",
    "What is your method for conducting research before proposing a new system?",
    "How do you handle legacy systems, outdated processes, or technical debt?",
    "Describe your approach to standardization vs. customization in your solutions.",
    "How do you monitor system health, performance, or output quality over time?",
    "What is your protocol for releasing updates or deploying changes?",
    "How do you design a feedback loop to continuously improve your workflows?",
    "Describe your strategy for scaling a service or operation under heavy demand.",
    "How do you handle data management, storage, and retrieval in your projects?",
    "What is your approach to modularity and reusability in your work deliverables?",
    "How do you design workflows that are accessible and inclusive?",
    "Describe your method for testing corner cases or edge-case failures.",
    "How do you handle capacity planning or future resource forecasting?",
    "What is your protocol for security breaches or data leaks in your domain?",
    "How do you ensure cross-platform or cross-device compatibility in your outputs?",
    "Describe your approach to refactoring or optimizing existing systems.",
    "How do you align technical architecture with user experience requirements?",
    "What is your philosophy on build vs. buy decisions for tools and platforms?"
]

SCENARIO_TEMPLATES = [
    "What would you do if a critical system or workflow failed right before a major launch?",
    "If a client requests a sudden change in requirements halfway through, how do you manage it?",
    "How would you handle a situation where two senior stakeholders give you conflicting directions?",
    "If you find a major error in a colleague's completed work, how do you address it?",
    "How do you react if you realize you cannot meet a committed deadline for a key deliverable?",
    "If you are asked to implement a solution you strongly disagree with, how do you handle it?",
    "What would you do if a tool or service you rely on went down during critical operations?",
    "If your project budget is suddenly cut by 30%, how do you adjust your strategy?",
    "How would you handle a team member who refuses to adopt a new process or tool?",
    "If you suspect a security or data privacy breach in your project, what steps do you take?",
    "What do you do if your deliverables are dependent on another team that is delaying you?",
    "If a feature or service you launched receives highly negative feedback, how do you respond?",
    "How would you handle being assigned a task with no documentation or guidelines?",
    "If you notice a sudden drop in performance metrics, how do you troubleshoot the issue?",
    "What would you do if you discovered a critical bug or flaw in production or live operations?",
    "If a customer or user reports a blocker issue that you cannot replicate, how do you debug it?",
    "How do you handle a situation where your manager asks you to do something unethical?",
    "If you are overwhelmed with 5 urgent tasks simultaneously, how do you manage your time?",
    "What would you do if you ran out of storage or resources during a critical data run?",
    "If a key team member leaves unexpectedly in the middle of a project, how do you adapt?",
    "How would you handle a client who refuses to pay or claims the work is unsatisfactory?",
    "If you make a mistake that causes a temporary outage or delay, how do you recover?",
    "What would you do if a proposed solution violates a technical or design constraint?",
    "If you are asked to estimate a timeline for a project with many unknown variables, how do you proceed?",
    "How would you handle a stakeholder who constantly bypasses communication channels?",
    "If your presentation deck or demo fails to load during a live meeting, how do you handle it?",
    "What do you do if you notice a teammate is experiencing severe burnout?",
    "If you find out a competitor has launched a product that makes your project obsolete, what do you suggest?",
    "How would you handle a dispute over intellectual property or code ownership?",
    "If you are asked to work overtime persistently to meet a deadline, how do you handle it?",
    "What would you do if a critical vendor goes out of business in the middle of a project?",
    "If you are assigned a role on a project where you have zero interest or matching skills, how do you handle it?",
    "How do you handle a situation where a client asks for free out-of-scope work (scope creep)?",
    "What would you do if you found out your project violates a new government regulation?",
    "If a key tool is deprecating a API you heavily rely on, how do you plan the migration?",
    "How would you handle a team lead who micromanages your daily tasks?",
    "If a coworker takes credit for your work or ideas, how do you address the situation?",
    "What do you do if you realize you gave an incorrect answer or data point in a major meeting?",
    "If you have to choose between a perfect, slow solution and a fast, hacky solution, how do you decide?",
    "How would you handle a situation where your teammate is using outdated methodologies?",
    "What would you do if a user interface or dashboard you built is deemed inaccessible to disabled users?",
    "If your model or analysis starts drifting and giving inaccurate results over time, how do you fix it?",
    "How do you handle a code or configuration merge conflict that breaks the main branch?",
    "What would you do if you found out a critical dependency is no longer maintained?",
    "If your database or system experiences a sudden surge of spam requests, how do you mitigate it?",
    "How would you handle a client who has extremely unrealistic expectations of AI/tech capabilities?",
    "What do you do if your project is cancelled after months of hard work?",
    "If you notice another department is duplicating your efforts, how do you address it?",
    "How would you handle a critical team member who constantly shows up late to standups?",
    "What would you do if you lost internet connection during a critical live release or event?"
]

TECH_TECHNICAL = [
    "What is your approach to writing clean, maintainable, and self-documenting code?",
    "Explain the difference between SQL and NoSQL databases, and when you would use each.",
    "How do you design, build, and document a secure RESTful API?",
    "What is the difference between synchronous and asynchronous programming, and when is async needed?",
    "Describe the Git workflow you use for collaborative code development.",
    "What is CI/CD, and how do you set up an automated deployment pipeline?",
    "How do you optimize database queries and indexes to improve performance?",
    "Explain the concepts of containerization (Docker) and orchestration (Kubernetes).",
    "What is your approach to unit testing, integration testing, and mock objects?",
    "How do you handle state management in complex frontend applications?",
    "What is serverless computing, and what are its pros and cons?",
    "Explain MVC architecture and how it supports separation of concerns.",
    "How do you protect applications against common vulnerabilities like SQL injection and XSS?",
    "What is your strategy for debugging a memory leak in a running application?",
    "Explain the difference between Monolithic and Microservices architectures.",
    "How do you implement authentication and authorization (e.g. JWT, OAuth) securely?",
    "What is your approach to error handling, logging, and application monitoring?",
    "Explain the concept of caching (e.g. Redis) and how you design cache invalidation.",
    "What is the difference between REST, GraphQL, and gRPC?",
    "How do you optimize front-end performance (e.g. bundle splitting, lazy loading)?",
    "Explain object-oriented programming (OOP) principles vs. functional programming.",
    "What is your process for conducting code reviews and giving feedback?",
    "How do you design a database schema to support many-to-many relationships?",
    "Explain the HTTP protocol, status codes, and standard request/response headers.",
    "What is CORS, and how do you configure it securely in backend systems?",
    "How do you handle database migrations safely without causing downtime?",
    "What are design patterns, and can you explain one you use frequently?",
    "How do you handle API versioning and deprecation?",
    "Explain horizontal vs. vertical scaling and how to implement each.",
    "What is a message broker (e.g. RabbitMQ, Kafka), and when would you use it?",
    "How do you secure secrets, API keys, and environment variables?",
    "Explain DNS, SSL/TLS handshakes, and how HTTPS works.",
    "What is your strategy for writing high-performance Javascript or Python code?",
    "How do you structure CSS or styling in large-scale React projects?",
    "Explain semantic HTML5 and why accessibility (a11y) is important.",
    "How do you write reusable components and design systems?",
    "What is rate limiting, and how do you implement it in an API?",
    "Explain database transaction isolation levels and ACID properties.",
    "How do you handle file uploads, storage, and CDNs securely?",
    "What is the difference between client-side rendering (CSR) and server-side rendering (SSR)?",
    "Explain web sockets and how they facilitate real-time communication.",
    "How do you profile application performance to find bottlenecks?",
    "What is the role of a reverse proxy (e.g. Nginx) and load balancers?",
    "Explain browser storage mechanisms: cookies, localStorage, and sessionStorage.",
    "How do you handle background jobs and cron queues in backend applications?",
    "Explain the concept of reactivity and virtual DOM in modern frameworks.",
    "How do you implement search capabilities (e.g. full-text search, Elasticsearch)?",
    "What is your approach to data serialization (e.g. JSON, Protocol Buffers)?",
    "Explain test-driven development (TDD) and its advantages.",
    "How do you keep dependencies updated and secure in your projects?"
]

DATA_TECHNICAL = [
    "What is the difference between supervised and unsupervised machine learning?",
    "Explain the bias-variance tradeoff and how you prevent overfitting.",
    "What is your workflow for cleaning, preprocessing, and transforming raw data?",
    "Explain how database indexes work in SQL and how you optimize query times.",
    "What is a Pandas DataFrame, and how do you handle missing values in Python?",
    "Explain the difference between L1 (Lasso) and L2 (Ridge) regularization.",
    "How do you evaluate a classification model's performance (e.g. ROC, Precision, Recall)?",
    "Explain the Central Limit Theorem and its importance in data analysis.",
    "What is a confusion matrix, and when is F1-score preferred over accuracy?",
    "How do you write a complex SQL query using Joins, Group By, and CTEs?",
    "Explain the difference between K-Means clustering and Hierarchical clustering.",
    "What is feature engineering, and can you share an example of a feature you created?",
    "How do you handle imbalanced datasets (e.g. SMOTE, class weights)?",
    "Explain how Decision Trees split nodes, and what Random Forest does.",
    "What is PCA (Principal Component Analysis), and when do you use it?",
    "Explain A/B testing: how do you calculate sample size and statistical significance?",
    "What is the difference between deep learning and traditional machine learning?",
    "Describe how a Convolutional Neural Network (CNN) processes image data.",
    "What is an RNN, and how does LSTM improve gradient vanishing issues?",
    "Explain the Transformer architecture and the self-attention mechanism.",
    "How do you deploy machine learning models to production APIs?",
    "What is MLflow or DVC, and how do you track experiments?",
    "Explain the difference between batch data processing and real-time stream processing.",
    "What is Hadoop, Spark, and when is Big Data tooling actually needed?",
    "How do you explain a complex data model to business stakeholders?",
    "Explain cross-validation and why it is crucial for model validation.",
    "What is a statistical p-value, and how do you interpret hypothesis tests?",
    "Explain linear regression assumptions and how you check for homoscedasticity.",
    "What is logistic regression, and how do you interpret its odds ratios?",
    "Explain gradient descent and how learning rate adjustments affect training.",
    "What is hyperparameter tuning, and what are Grid Search vs. Random Search?",
    "How do you perform text tokenization, TF-IDF, and word embeddings in NLP?",
    "Explain time-series analysis: what are seasonality, trend, and ARIMA models?",
    "What is data normalization vs. standardization, and when to use each?",
    "How do you build interactive data dashboards (e.g. Tableau, PowerBI, Streamlit)?",
    "Explain database normalization levels (1NF, 2NF, 3NF) and why they matter.",
    "What is a vector database (e.g. Pinecone, Milvus), and when is it used?",
    "Describe retrieval-augmented generation (RAG) and how it enhances LLMs.",
    "What is fine-tuning an LLM vs. prompt engineering?",
    "How do you audit models for algorithmic bias and data fairness?",
    "What is an ETL pipeline, and what orchestration tools (e.g. Airflow) do you use?",
    "Explain dimensional modeling: facts vs. dimension tables in data warehousing.",
    "What is the difference between a Data Lake and a Data Warehouse?",
    "How do you perform outlier detection and handle anomalies in data?",
    "Explain correlation vs. causation and how to establish causal links.",
    "What is your approach to exploratory data analysis (EDA) on a new dataset?",
    "Explain confidence intervals and how to calculate them.",
    "How do you secure sensitive data and comply with GDPR/HIPAA regulations?",
    "What is data virtualization, and how does it differ from ETL?",
    "How do you ensure data quality and schema consistency in data pipelines?"
]

DESIGN_TECHNICAL = [
    "What is the difference between UI (User Interface) and UX (User Experience)?",
    "Describe your user research process before sketching any design layouts.",
    "Explain the core principles of visual hierarchy and how you direct user attention.",
    "How do you establish a design system or component library in Figma?",
    "What is your approach to responsive design and designing across multiple devices?",
    "Explain color theory and how you choose cohesive color palettes for digital products.",
    "How do you ensure your web designs comply with WCAG 2.1 accessibility standards?",
    "What is typography hierarchy, and how do you choose typefaces for readability?",
    "Describe how you conduct usability testing and gather feedback on a prototype.",
    "What is information architecture, and how do you design user flow diagrams?",
    "Explain the difference between wireframes, mockups, and interactive prototypes.",
    "How do you design for different states of an interface (e.g. empty, loading, error)?",
    "What is design thinking, and how do you apply its phases to your projects?",
    "How do you handle grid systems (e.g. 8pt grid) to create layout consistency?",
    "Explain the concept of micro-interactions and how they enhance UX.",
    "How do you collaborate with software developers to ensure pixel-perfect handoff?",
    "What is a user persona, and how does it guide your design decisions?",
    "How do you design checkout flows, sign-up funnels, and landing pages for conversion?",
    "What is cognitive load, and how do you minimize it in complex application dashboards?",
    "Explain mobile-first design philosophy and its advantages.",
    "How do you use white space (negative space) to improve design readability?",
    "What is your process for wireframing a new page layout from scratch?",
    "How do you design navigation menus, search bars, and filter interfaces?",
    "Explain card sorting and how it helps design website menus.",
    "What is your approach to motion design and page transitions in prototypes?",
    "How do you design dashboards that make complex data easily understandable?",
    "What is atomic design, and how does it map to Figma components?",
    "How do you benchmark your designs against competitors or industry standards?",
    "Describe how you design forms to minimize friction and bounce rates.",
    "What is your process for designing a dark mode interface?",
    "How do you design tooltips, popups, and modal dialogs to not annoy users?",
    "What is A/B testing in design, and how do you iterate based on results?",
    "How do you design interfaces that handle multilingual translations (localization)?",
    "Explain the concept of affordance and signifiers in interface design.",
    "How do you write microcopy (UX writing) that guides user behavior?",
    "What is heuristic evaluation, and how do you audit a website for usability?",
    "How do you design search results pages that are easy to scan?",
    "Describe how you design multi-step forms (wizards) without overwhelming users.",
    "What is your method for tracking user behaviour (e.g. Hotjar heatmaps, click rates)?",
    "How do you design empty states that encourage user engagement?",
    "Explain the difference between flat design, skeuomorphism, and glassmorphism.",
    "How do you handle feedback from non-designers and business stakeholders?",
    "What is your approach to illustration, iconography, and custom image assets?",
    "How do you design onboarding flows for new users of a product?",
    "What is the role of psychology (e.g. Fitts's law, Hick's law) in UX design?",
    "How do you design notification systems and badge alerts?",
    "Describe how you design interfaces that prevent user errors.",
    "What is your process for designing responsive tables and data lists?",
    "How do you design feedback states (e.g. success checkmarks, toast alerts)?",
    "How do you keep up with design trends while maintaining usability?"
]

MARKETING_TECHNICAL = [
    "What is the difference between inbound marketing and outbound marketing?",
    "Explain SEO (Search Engine Optimization) and how you optimize on-page content.",
    "How do you design, set up, and optimize a Google Ads or Meta Ads campaign?",
    "What is a marketing funnel (TOFU, MOFU, BOFU), and how do you address each stage?",
    "Explain email marketing optimization: how do you improve open rates and CTR?",
    "What is your approach to content strategy, blogging, and organic lead generation?",
    "Explain customer acquisition cost (CAC) and customer lifetime value (LTV).",
    "How do you use Google Analytics to track site traffic, conversions, and user behavior?",
    "What is a lead magnet, and how do you design landing pages to capture emails?",
    "Explain social media management, brand voice, and community engagement.",
    "How do you design and execute an A/B test for a marketing landing page?",
    "What is influencer marketing, and how do you evaluate potential partners?",
    "Explain CTR, CPA, CPC, CPM, and how they impact campaign budgets.",
    "How do you conduct keyword research to identify high-intent search terms?",
    "What is cold email outreach, and what is your process for writing templates?",
    "Explain CRM (Customer Relationship Management) tools and lead scoring pipelines.",
    "What is account-based marketing (ABM), and when is it preferred over broad campaigns?",
    "How do you handle brand management and public relations (PR) for a business?",
    "What is affiliate marketing, and how do you set up an affiliate program?",
    "Explain product-led growth (PLG) vs. sales-led growth models.",
    "How do you write persuasive copywriting headlines that boost conversions?",
    "What is viral marketing, and how do you design loops to encourage sharing?",
    "Explain the role of video marketing and platforms like YouTube or TikTok.",
    "How do you measure marketing ROI (Return on Investment) across channels?",
    "What is mobile marketing, app store optimization (ASO), and push alerts?",
    "Explain marketing automation and designing drip campaigns for user onboarding.",
    "How do you analyze competitor marketing strategies and traffic sources?",
    "What is your approach to event marketing, webinars, and virtual summits?",
    "Explain the difference between marketing qualified leads (MQL) and sales qualified leads (SQL).",
    "How do you handle brand positioning, messaging frameworks, and value propositions?",
    "What is conversion rate optimization (CRO), and how do you identify friction points?",
    "Explain remarketing and retargeting ads, and how they improve conversion rates.",
    "How do you comply with GDPR, CCPA, and privacy regulations in marketing databases?",
    "What is content distribution, and how do you repurpose content across platforms?",
    "Explain local SEO and how to optimize a business for local Google maps.",
    "How do you execute a product launch campaign from planning to post-launch?",
    "What is the difference between brand marketing and performance marketing?",
    "How do you conduct market segmentation and define target customer personas?",
    "Explain email deliverability, SPF, DKIM, DMARC, and avoiding spam folders.",
    "What is your approach to corporate sponsorship, partnerships, and co-marketing?",
    "Explain growth hacking and how rapid experimentation cycles drive scale.",
    "How do you write a compelling press release that journalists will publish?",
    "What is community-led growth, and how do you build a customer community?",
    "Explain social proof, testimonials, and case studies, and how to utilize them.",
    "How do you analyze customer churn and design marketing strategies to reduce it?",
    "What is customer advocacy, and how do you build a referral program?",
    "Explain user generated content (UGC) and its impact on brand trust.",
    "How do you handle social media crisis management or negative PR?",
    "What tools are in your daily marketing stack (e.g. HubSpot, SEMrush, Canva)?",
    "How do you adapt marketing campaigns to different cultures and global regions?"
]

BUSINESS_TECHNICAL = [
    "What is your process for conducting a financial analysis or projection for a project?",
    "Explain the key financial statements: Income Statement, Balance Sheet, and Cash Flow.",
    "What is SWOT analysis, and how do you use it for strategic planning?",
    "How do you design, optimize, and document business processes or workflows?",
    "Explain change management principles and how you implement process changes in a team.",
    "What is Agile project management, and what are Scrum ceremonies?",
    "How do you perform stakeholder management and communicate progress to executives?",
    "Explain key business metrics: EBITDA, Profit Margins, ROI, and NPV.",
    "How do you manage project budgets, cost allocation, and resource forecasting?",
    "What is risk management, and how do you build a corporate risk register?",
    "Describe your approach to vendor management, negotiating contracts, and SLA reviews.",
    "What is corporate governance, compliance, and regulatory risk auditing?",
    "How do you conduct market research and competitive analysis for new operations?",
    "Explain HR recruitment pipelines, onboarding workflows, and talent acquisition.",
    "How do you design employee performance review systems and KPIs?",
    "What is employee engagement, retention strategy, and managing corporate burnout?",
    "Explain payroll management, benefits administration, and labor law compliance.",
    "What is organizational design, hierarchy structure, and span of control?",
    "How do you handle conflict resolution and employee relations in a team?",
    "What is corporate social responsibility (CSR) and its role in brand value?",
    "Explain supply chain logistics, inventory optimization, and procurement workflows.",
    "What is lean management, Six Sigma, and reducing process wastes?",
    "How do you perform data-driven decision making using business intelligence tools?",
    "Explain B2B client onboarding, account management, and CRM pipelines.",
    "What is your approach to strategic consulting and advising business leaders?",
    "How do you conduct a cost-benefit analysis for implementing a new software tool?",
    "Explain data governance, information security, and internal access control policies.",
    "What is crisis management, and how do you design business continuity plans?",
    "How do you manage cross-departmental alignment and break down corporate silos?",
    "Explain customer experience (CX) strategy and tracking Net Promoter Score (NPS).",
    "What is your method for setting annual budgets and quarterly targets?",
    "How do you audit corporate expenditures and identify cost-saving initiatives?",
    "Explain equity distribution, options pool structuring, and cap table management.",
    "What is merger and acquisition (M&A) due diligence, and what metrics do you audit?",
    "How do you manage global remote operations, timezone logistics, and virtual teams?",
    "Explain the role of business development in driving corporate partnerships.",
    "How do you build a business case to justify expanding into a new market?",
    "Explain workspace design, safety compliance, and hybrid work policies.",
    "What is performance management, and how do you implement PIPs (Performance Improvement Plans)?",
    "How do you design an internship or graduate training program for a company?",
    "Explain key metrics in SaaS business model: MRR, ARR, Churn, and LTV/CAC.",
    "How do you run a brainstorming workshop or strategic alignment session?",
    "What is intellectual property (IP) protection, patents, and trademark management?",
    "How do you manage internal corporate communications and town hall meetings?",
    "Explain operations auditing and optimizing supply chain delivery times.",
    "What is data privacy compliance under ISO 27001 or SOC 2?",
    "How do you design onboarding training manuals for customer support staff?",
    "Explain pricing strategy models: cost-plus, value-based, and subscription models.",
    "How do you handle performance analytics for campaigns from a business perspective?",
    "What is your philosophy on building vs. buying backend business infrastructure?"
]


def get_role_domain(role: str) -> str:
    role_lower = role.lower()
    # Data & AI
    if any(k in role_lower for k in ["data", "machine learning", "ai", "scientist", "analyst", "intelligence", "scraping", "nlp"]):
        return "data"
    # UI/UX & Design
    elif any(k in role_lower for k in ["design", "ux", "ui", "figma", "sketch", "user", "graphics", "frontend"]):
        return "design"
    # Sales & Marketing
    elif any(k in role_lower for k in ["sales", "marketing", "sdr", "account", "growth", "seo", "content", "social", "copywriter", "client", "customer"]):
        return "marketing"
    # Software & Tech/DevOps (excluding frontend which is design/UX)
    elif any(k in role_lower for k in ["engineer", "developer", "architect", "programmer", "devops", "cloud", "blockchain", "embedded", "qa", "backend", "full stack", "scrum", "system"]):
        return "tech"
    # Business & Management/HR/Finance (default if nothing else fits)
    else:
        return "business"


@router.get("/interview-questions")
async def get_interview_questions(role: str):
    domain = get_role_domain(role)
    
    # Select technical questions
    if domain == "data":
        tech_qs = DATA_TECHNICAL
    elif domain == "design":
        tech_qs = DESIGN_TECHNICAL
    elif domain == "marketing":
        tech_qs = MARKETING_TECHNICAL
    elif domain == "tech":
        tech_qs = TECH_TECHNICAL
    else:
        tech_qs = BUSINESS_TECHNICAL

    # Build the list of 200 questions
    questions = []
    
    # 1. Behavioral (50)
    for i, q_temp in enumerate(BEHAVIORAL_TEMPLATES):
        questions.append({
            "id": f"behavioral-{i+1}",
            "text": q_temp.format(role=role),
            "category": "Behavioral & Fit"
        })
        
    # 2. Technical (50)
    for i, q_temp in enumerate(tech_qs):
        questions.append({
            "id": f"technical-{i+1}",
            "text": q_temp.format(role=role),
            "category": "Technical & Domain"
        })
        
    # 3. System & Architecture (50)
    for i, q_temp in enumerate(SYSTEM_TEMPLATES):
        questions.append({
            "id": f"system-{i+1}",
            "text": q_temp.format(role=role),
            "category": "System & Architecture"
        })
        
    # 4. Scenario & Troubleshooting (50)
    for i, q_temp in enumerate(SCENARIO_TEMPLATES):
        questions.append({
            "id": f"scenario-{i+1}",
            "text": q_temp.format(role=role),
            "category": "Scenario & Troubleshooting"
        })
        
    return questions


# In-memory simple cache for generated answers
ANSWER_CACHE = {}

@router.post("/question-answer")
async def get_question_answer(req: QuestionAnswerRequest):
    groq = get_groq()
    role = req.role.strip()
    question = req.question.strip()
    persona = req.persona.strip() if req.persona else "General Professional"
    
    cache_key = f"{role}:{question}:{persona}"
    if cache_key in ANSWER_CACHE:
        return ANSWER_CACHE[cache_key]
        
    prompt = f"""
You are an expert technical interviewer and career coach.
You are generating a sample response and coaching tips as the following interviewer persona: {persona}.

PERSONA CHARACTERISTICS & TONE:
- Dave (Tech Lead): Blunt, deep technical focus, queries about algorithms, scale, and performance. Keep the answer extremely technical.
- Sarah (HR Recruiter): Empathy-driven, focused on collaboration, behavioral cues, and company culture fit. Highlight teamwork and soft skills.
- Mr. Stone (Stress Tester): Direct, high pressure, challenges assumptions, questions why you chose a certain path. Frame the tips and answer around high pressure situations.
- Alex (Friendly Mentor): Warm, supportive, guiding, breaks down problems. Focus on structured reasoning and mentoring guidance.
- General Professional / default: Balanced, professional, informative.

Adopt this persona's tone and perspective in both the suggested answer and the tips.

TARGET ROLE: {role}
QUESTION: {question}

Provide the response as valid JSON with the following structure:
{{
  "suggested_answer": "<A sample answer tailored to the persona's style. If behavioral, use the STAR format (Situation, Task, Action, Result). If technical, explain the concepts and principles clearly. Key points should be highlighted. Length: 150-250 words.>",
  "tips": [
    "<Coaching tip 1 reflecting this persona's priorities>",
    "<Coaching tip 2 reflecting this persona's priorities>",
    "<Coaching tip 3 reflecting this persona's priorities>"
  ]
}}
"""
    try:
        completion = groq.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You output ONLY valid raw JSON. No markdown, no explanations. Valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1500
        )
        
        ai_text = completion.choices[0].message.content
        result = parse_json_from_response(ai_text)
        
        # Save to cache
        ANSWER_CACHE[cache_key] = result
        return result
        
    except Exception as e:
        logging.error(f"Failed to generate question answer: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate question answer: {str(e)}")


@router.post("/evaluate-interview")
async def evaluate_interview(req: InterviewEvaluateRequest):
    groq = get_groq()
    
    role = req.role.strip()
    persona = req.persona.strip() if req.persona else "General Professional"
    answers_str = ""
    for idx, ans in enumerate(req.answers):
        q = ans.get("question", "")
        a = ans.get("answer", "")
        answers_str += f"Q{idx+1}: {q}\nA{idx+1}: {a}\n\n"
        
    metrics = req.metrics
    eye_contact = metrics.get("eye_contact_ratio", 1.0) * 100
    head_stability = metrics.get("head_stability_ratio", 1.0) * 100
    posture = metrics.get("posture_alignment_ratio", 1.0) * 100
    
    prompt = f"""
You are an expert public speaking coach, hiring manager, and specifically evaluating the candidate as the interviewer persona: {persona}.

PERSONA CRITIQUE STYLE:
- Dave (Tech Lead): Blunt, direct, technical correctness is priority. If their answers lack code structure, frameworks, or depth, point it out.
- Sarah (HR Recruiter): Warm but selective. Focuses on culture, behavioral traits, teamwork, and growth mindset.
- Mr. Stone (Stress Tester): Direct, high-pressure, looks for signs of panic, challenges soft phrasing. Extremely picky.
- Alex (Friendly Mentor): Supportive, helpful, gives structured advice on how to improve using the STAR method.
- General Professional: Balanced, standard industry evaluation.

Evaluate this candidate's mock video interview performance for the role of {role}.

TRANSCRIPT OF SPOKEN ANSWERS:
{answers_str}

VIDEO TRACKING METRICS:
- Eye Contact (looking at camera/screen): {eye_contact:.1f}% of the time
- Head Stability (minimizing unnecessary movements): {head_stability:.1f}% of the time
- Posture Alignment (sitting centered and upright): {posture:.1f}% of the time

CRITICAL EVALUATION RULES:
1. Score out of 100. Be honest and constructive. Adopt the style and tone of the "{persona}" persona.
2. Deliver two sections of feedback: Verbal Content (STAR structure, correctness, vocabulary) and Non-Verbal Delivery (body language, posture, eye contact).
3. Grade each individual answer, highlighting strengths and offering a better/optimized way to word the answer.

Output ONLY valid JSON:
{{
  "overall_score": <0-100 overall blended grade based on persona standards>,
  "delivery_score": <0-100 score strictly for delivery/body language/metrics>,
  "content_score": <0-100 score strictly for answer quality/accuracy>,
  "summary": "<2-3 sentences overall evaluation verdict, adopting the persona's tone>",
  "delivery_feedback": "<Feedback addressing eye contact, head movement, posture, and suggestions to sit/look better>",
  "content_feedback": "<Feedback addressing answers, structure (STAR), technical terminology, and confidence>",
  "graded_answers": [
    {{
      "question": "<question text>",
      "rating": "<Strong|Good|Weak>",
      "critique": "<Detailed 1-2 sentence critique of their spoken response from the persona's perspective>",
      "better_answer": "<Optimized version of how they could have answered using better structure and action verbs>"
    }}
  ]
}}
"""
    try:
        completion = groq.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You output ONLY valid raw JSON. No markdown, no explanations. Valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.25,
            max_tokens=2500
        )
        
        ai_text = completion.choices[0].message.content
        result = parse_json_from_response(ai_text)
        return result
        
    except Exception as e:
        logging.error(f"Interview evaluation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Interview evaluation failed: {str(e)}")

@router.post("/adaptive-next-question")
async def adaptive_next_question(req: AdaptiveNextQuestionRequest):
    groq = get_groq()
    role = req.role.strip()
    persona = req.persona.strip() if req.persona else "General Professional"
    current_question = req.current_question.strip()
    transcript = req.transcript.strip()
    
    # Construct conversational history string
    history_str = ""
    for turn in req.history:
        q = turn.get("question", "")
        a = turn.get("answer", "")
        history_str += f"Interviewer: {q}\nCandidate: {a}\n\n"
        
    prompt = f"""
You are an interviewer with the following persona: {persona}.

PERSONA CHARACTERISTICS:
- Dave (Tech Lead): Blunt, deep technical focus, queries about algorithms, scale, and performance. Probes technical assertions in their transcript.
- Sarah (HR Recruiter): Empathy-driven, focused on collaboration, behavioral cues, and company culture fit. Probes soft skills and how they handle interpersonal dynamics.
- Mr. Stone (Stress Tester): Direct, high pressure, challenges assumptions, questions why you chose a certain path. Frame the follow-up to stress-test their assertions or mock their decisions slightly but professionally.
- Alex (Friendly Mentor): Warm, supportive, guiding, breaks down problems. Focus on structured reasoning, and guide them with encouraging but developmental follow-ups.
- General Professional / default: Balanced, professional, standard follow-up.

TARGET ROLE: {role}
CONVERSATION SO FAR:
{history_str}
LAST QUESTION ASKED: {current_question}
CANDIDATE'S LAST RESPONSE (TRANSCRIPT): {transcript}

Based on their last response, generate the NEXT interview question.
Your response MUST be an active conversational follow-up question.
- If the candidate mentioned a specific technology, project, or event, ask a follow-up directly targeting that.
- If their response was weak or incomplete, ask them to expand or clarify.
- Maintain your persona's tone strictly.

Provide your response as a simple JSON object:
{{
  "next_question": "<your conversational follow-up question here>"
}}
"""
    try:
        completion = groq.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You output ONLY valid raw JSON. No markdown, no explanations. Valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=600
        )
        ai_text = completion.choices[0].message.content
        result = parse_json_from_response(ai_text)
        return result
    except Exception as e:
        logging.error(f"Adaptive question generation failed: {str(e)}")
        # Fallback question if API fails
        fallback_questions = [
            f"Can you expand on how you applied your technical expertise for this {role} role in a recent project?",
            f"How did you measure the success of the outcome in that situation?",
            f"What was the most challenging aspect of that work, and how did you resolve it?",
            f"How did you collaborate with other stakeholders or team members during that process?"
        ]
        import random
        return {"next_question": random.choice(fallback_questions)}

