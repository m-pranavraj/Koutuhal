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
    
    # Construct Prompt (Simplified version of original Mega-Prompt)
    roles_text = "\n".join([f"{i+1}. {r.role} (JD: {r.job_description[:500] if r.job_description else 'N/A'})" for i, r in enumerate(req.roles)])
    
    prompt = f"""
    You are a top resume analyst. Analyze this resume text for the following target roles:
    {roles_text}
    
    RESUME TEXT:
    {req.resume_text[:15000]}
    
    Task:
    1. Validate if it's a resume.
    2. Calculate ATS Score (0-100) on formatting, keywords, structure.
    3. Analyze match for EACH target role (0-100%, verdict, why good/bad).
    4. Identify Step 3: Best Fit Role.
    5. List 5 Strengths and 5 Gaps.
    6. Recommend 3 other suitable roles.
    7. Executive Summary.
    
    Output JSON ONLY. Format:
    {{
      "is_resume": true,
      "not_resume_reason": null,
      "ats_score": {{ "overall": 75, "formatting": 80, "tips": ["tip1"] }},
      "role_matches": [ {{ "role": "Role Name", "match_percentage": 80, "verdict": "Good", "why_good": "...", "why_not_good": "..." }} ],
      "best_for": {{ "role": "...", "match_percentage": 90, "reasoning": "..." }},
      "strengths": ["..."],
      "gaps": ["..."],
      "recommendations": [ {{ "role": "...", "score": 85, "reason": "..." }} ],
      "summary": "..."
    }}
    """
    
    try:
        completion = groq.chat.completions.create(
            model=settings.LLM_MODEL if "llama" in settings.LLM_MODEL else "llama-3.1-8b-instant", # Default to fast model
            messages=[
                {"role": "system", "content": "You output ONLY valid raw JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=4000
        )
        
        ai_text = completion.choices[0].message.content
        analysis = parse_json_from_response(ai_text)
        
        # Save to Supabase
        # Flatten roles for storage
        role_str = ", ".join([r.role for r in req.roles])
        jd_str = req.roles[0].job_description if req.roles else None
        
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
