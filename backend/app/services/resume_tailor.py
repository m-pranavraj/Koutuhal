from app.services.llm.factory import get_llm_provider
from typing import Dict, Any, List
import logging
import json

logger = logging.getLogger(__name__)

class ResumeTailorService:
    def __init__(self):
        self.llm = get_llm_provider()

    async def analyze_job_description(self, jd_text: str) -> Dict[str, Any]:
        """
        Analyzes a Job Description to extract keywords, hard skills, and tone.
        """
        prompt = f"""
        You are an expert Technical Recruiter and ATS Specialist.
        Analyze the following Job Description and extract key information.

        Job Description:
        {jd_text[:10000]}

        Output strict JSON:
        {{
            "keywords": ["keyword1", "keyword2", ...],
            "hard_skills": ["skill1", "skill2", ...],
            "soft_skills": ["skill1", "skill2", ...],
            "tone": "formal/startup/academic/etc",
            "key_responsibilities": ["resp1", "resp2", ...]
        }}
        """

        try:
            response = await self.llm.client.chat.completions.create(
                model=self.llm.model,
                messages=[
                    {"role": "system", "content": "You are an expert ATS analyzer. Output JSON only."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" },
                temperature=0.1
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            logger.error(f"JD Analysis Failed: {e}")
            raise e

    async def tailor_resume(self, resume_text: str, jd_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Rewrites the resume content to align with the analyzed Job Description.
        """
        jd_summary = json.dumps(jd_analysis)
        
        prompt = f"""
        You are a World-Class Resume Writer and ATS Optimizer.
        Rewrite the candidate's resume to perfectly align with the target Job Description profile.

        Target Profile (from JD):
        {jd_summary}

        Original Resume:
        {resume_text[:20000]}

        INSTRUCTIONS:
        1. Rewrite the "Professional Summary" to incorporate key keywords and tone.
        2. Rewrite "Experience" bullet points. valid hard skills from the JD must be naturally integrated where user experience supports it.
        3. Do NOT invent false experience. optimize existing experience.
        4. Quantify results where possible (or keep existing quantization).
        5. Maintain the original structure but upgraded.

        Output strict JSON:
        {{
            "tailored_summary": "...",
            "tailored_experience": [
                {{
                    "company": "...",
                    "role": "...",
                    "duration": "...",
                    "description": ["bullet 1 rewritten", "bullet 2 rewritten", ...]
                }},
                ...
            ],
            "match_score_before": 0-100,
            "match_score_after": 0-100,
            "improvements_made": ["Changed X to Y to match keyword Z", ...]
        }}
        """

        try:
            response = await self.llm.client.chat.completions.create(
                model=self.llm.model,
                messages=[
                    {"role": "system", "content": "You are a Resume Optimizer. Output JSON only."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" },
                temperature=0.3
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            logger.error(f"Resume Tailoring Failed: {e}")
            raise e

resume_tailor_service = ResumeTailorService()
