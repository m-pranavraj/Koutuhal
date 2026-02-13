from abc import ABC, abstractmethod
from typing import Dict, Any, List

class LLMProvider(ABC):
    @abstractmethod
    async def analyze_resume(self, resume_text: str, job_description: str = "") -> Dict[str, Any]:
        pass
    
    @abstractmethod
    async def match_jobs(self, resume_text: str, jobs_data: List[Dict]) -> List[Dict]:
        pass
