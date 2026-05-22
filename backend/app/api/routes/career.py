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
        # Check existing
        res = supabase.table("users").select("*").eq("email", email.strip()).execute()
        user = res.data[0] if res.data else None
        
        if not user:
            user_data = {"name": name.strip(), "email": email.strip(), "phone": phone.strip() if phone else None}
            # Note: Assuming 'users' table exists and allows insert. 
            # If using Auth Users, this might need adjustment, but based on original code it inserts to public.users
            res = supabase.table("users").insert(user_data).execute()
            user = res.data[0]
            
        user_id = user['id']
        
        # 2. Extract Text
        content = await resume.read()
        pdf_file = io.BytesIO(content)
        reader = pypdf.PdfReader(pdf_file)
        resume_text = ""
        for page in reader.pages:
            resume_text += page.extract_text() + "\n"
            
        # 3. Upload to Storage
        file_path = f"{user_id}/{resume.filename}"
        # Supabase storage upload requires bytes or file object. 
        # reset cursor
        pdf_file.seek(0)
        # Note: supabase-py storage upload might verify mime type
        res = supabase.storage.from_("resumes").upload(
            file_path, 
            content, # passing bytes directly
            file_options={"content-type": resume.content_type, "upsert": "true"} 
        )
        
        # Get Public URL
        public_url = supabase.storage.from_("resumes").get_public_url(file_path)
        
        # 4. Insert Resume Record
        resume_data = {
            "user_id": user_id,
            "file_path": file_path,
            "url": public_url,
            "resume_text": resume_text
        }
        res = supabase.table("resumes").insert(resume_data).execute()
        resume_record = res.data[0]
        
        return {
            "user_id": user_id,
            "resume_id": resume_record['id'],
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
  "summary": "<2-3 sentence executive summary. Use 'You' perspective. Mention overall career readiness, top match role, and one key action.>"
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
        if not analysis.get("ats_score"):
            raise ValueError("Missing ats_score in response")
        if not analysis.get("role_matches"):
            raise ValueError("Missing role_matches in response")
            
        # ── DETERMINISTIC SCORE ENFORCEMENT ──────────────────────────
        # Compute real alignment scores server-side, then override LLM hallucinations.

        # 1. Override ATS sub-scores with blended real + LLM
        llm_overall = int(analysis["ats_score"].get("overall", 0))
        llm_formatting = int(analysis["ats_score"].get("formatting", 0))

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
        if analysis.get("best_for") and analysis.get("role_matches"):
            best_match = max(analysis["role_matches"], key=lambda x: x.get("match_percentage", 0))
            analysis["best_for"]["role"] = best_match["role"]
            analysis["best_for"]["match_percentage"] = best_match["match_percentage"]

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
        
        # Use upsert or insert
        res = supabase.table("analyses").insert(save_data).execute()
        
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
