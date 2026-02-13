from .base import LLMProvider
from typing import Dict, Any, List
import openai
import json
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class UniversalLLMProvider(LLMProvider):
    """
    A universal provider that uses the OpenAI-compatible API standard.
    Works with: OpenAI, Perplexity, Grok, DeepSeek, LocalLLM (vLLM/Ollama), etc.
    """
    def __init__(self):
        api_key = settings.LLM_API_KEY or settings.OPENAI_API_KEY
        if not api_key:
             logger.warning("LLM_API_KEY not set. AI features might fail.")
        
        self.client = openai.AsyncOpenAI(
            api_key=api_key,
            base_url=settings.LLM_BASE_URL
        )
        self.model = settings.LLM_MODEL

    async def analyze_resume(self, resume_text: str, job_description: str = "") -> Dict[str, Any]:
        """
        Analyze resume using the configured LLM.
        """
        prompt = f"""
        You are an expert ATS (Applicant Tracking System) and Career Coach.
        Analyze the following resume text and provide a structured assessment.
        
        Resume Text:
        {resume_text[:20000]} 

        Target Job Description (Optional):
        {job_description[:5000]}

        Output properly formatted JSON matching this schema:
        {{
            "ats_score": {{ "score": 0-100, "rationale": "..." }},
            "skills": ["..."],
            "missing_keywords": ["..."],
            "strengths": ["..."],
            "weaknesses": ["..."],
            "suggestions": ["..."],
            "summary": "..."
        }}
        
        Do not output markdown code blocks. Just the raw JSON string.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful AI career assistant. Output strict JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" },
                temperature=0.2
            )
            
            content = response.choices[0].message.content
            # logger.info(f"LLM Response: {content}")
            
            try:
                result = json.loads(content)
            except json.JSONDecodeError:
                # Fallback clean if model included markdown
                content = content.replace("```json", "").replace("```", "")
                result = json.loads(content)
            
            # Attach usage
            if response.usage:
                result["_usage"] = response.usage.total_tokens
            
            # Attach metadata about who answered
            result["_provider_model"] = self.model
                
            return result
            
        except Exception as e:
            logger.error(f"Universal LLM Analysis Failed: {e}")
            raise e

    async def match_jobs(self, resume_text: str, jobs_data: List[Dict]) -> List[Dict]:
        jobs_summary = json.dumps([{ "id": str(j["id"]), "title": j["title"], "desc": j["description"][:200] } for j in jobs_data])
        
        prompt = f"""
        Rank the following jobs for this candidate based on their resume.
        
        Resume:
        {resume_text[:10000]}
        
        Jobs:
        {jobs_summary}
        
        Return JSON list:
        [
            {{ "job_id": "...", "match_score": 0-100, "reason": "..." }}
        ]
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Rank jobs for the candidate. JSON only."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" },
                temperature=0.2
            )
             
            content = response.choices[0].message.content
            
            try:
                result = json.loads(content)
            except json.JSONDecodeError:
                content = content.replace("```json", "").replace("```", "")
                result = json.loads(content)
            
            # Robust extraction
            if isinstance(result, dict):
                values = list(result.values())
                if values and isinstance(values[0], list):
                    return values[0]
                return []
                
            return result if isinstance(result, list) else []

        except Exception as e:
            logger.error(f"Universal LLM Matching Failed: {e}")
            raise e
