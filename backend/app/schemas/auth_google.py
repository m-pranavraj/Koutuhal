from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import Optional
from app.models.user import UserRole

class GoogleLogin(BaseModel):
    id_token: str

class GoogleLoginResponse(BaseModel):
    access_token: str
    token_type: str
    needs_onboarding: bool
    user: dict # or UserOut

class OnboardingCompleteIn(BaseModel):
    role: UserRole
    bio: Optional[str] = None
    company: Optional[str] = None # Not in User model yet? "bio?, company?, skills?". User has bio.
    # The user request mentioned company and skills.
    # I should stick to User model fields or add them if needed. 
    # Current User model: bio, xp_points. 
    # I'll convert company/skills to bio or omit for now if not in DB.
    # Or just store in bio/jsonb if I had one. 
    # Let's map bio only for now as per DB.
