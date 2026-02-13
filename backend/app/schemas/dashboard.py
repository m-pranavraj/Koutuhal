from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DashboardStatsOut(BaseModel):
    total_resumes: int
    total_applications: int
    applications_this_week: int
    avg_match_score: Optional[float]
    latest_application_date: Optional[datetime]
    total_jobs: int
