from typing import Any, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api import deps
from app.core import security
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserOut, Token, UserLogin
from app.core.database import get_db
from datetime import timedelta

router = APIRouter()
from app.core.limiter import limiter
from fastapi import Request

@router.post("/register", response_model=Token)
@limiter.limit("3/minute")
async def register(
    request: Request,
    user_in: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)]
) -> Any:
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # Security: Prevent Admin creation via public registration
    if user_in.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Admin accounts cannot be created publicly.",
        )

    # Create new user
    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        role=user_in.role,
        onboarding_completed=True # Register flow assumes they picked a role, so onboarding done?
        # Actually user_in has role, so yes.
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = security.create_access_token(user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)]
) -> Any:
    # Use form_data.username for email
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = security.create_access_token(user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

# Also support JSON login for flexibility
@router.post("/login/json", response_model=Token)
async def login_json(
    user_in: UserLogin,
    db: Annotated[AsyncSession, Depends(get_db)]
) -> Any:
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    
    if not user or not security.verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = security.create_access_token(user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def read_users_me(
    current_user: Annotated[User, Depends(deps.get_current_user)]
) -> Any:
    return current_user

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}

@router.post("/admin/login", response_model=Token)
async def admin_login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)]
) -> Any:
    """
    Admin-only login.
    """
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized as Admin")
    
    access_token = security.create_access_token(
        user.id,
        claims={"role": user.role.value, "onboarding": user.onboarding_completed}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

# --- Google Auth & Onboarding ---

from app.schemas.auth_google import GoogleLogin, GoogleLoginResponse, OnboardingCompleteIn
import uuid
from app.core.config import settings

# Google Auth Imports
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

@router.post("/google", response_model=GoogleLoginResponse)
@limiter.limit("5/minute")
async def google_login(
    request: Request,
    login_data: GoogleLogin,
    db: Annotated[AsyncSession, Depends(get_db)]
) -> Any:
    """
    Authenticate with Google ID Token.
    Creates user if not exists.
    """
    email = None
    name = None
    picture = None
    
    # 1. Verify Token
    try:
        # Request object
        request = google_requests.Request()
        
        # Verify with strict checks against GOOGLE_CLIENT_ID
        id_info = id_token.verify_oauth2_token(
            login_data.id_token, 
            request, 
            settings.GOOGLE_CLIENT_ID
        )
        
        # Strict issuer check
        if id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Invalid token issuer.')
            
        # Email verified check
        if not id_info.get('email_verified'):
             raise ValueError('Email not verified by Google.')

        # Payload checks passed
        email = id_info.get("email")
        name = id_info.get("name")
        picture = id_info.get("picture")
        
    except Exception as e:
        # Log error cleanly
        print(f"Google Token Verification Failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not email:
         raise HTTPException(status_code=400, detail="Could not retrieve email from token")

    # 2. Check User
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if not user:
        # Create new user
        user = User(
            name=name or "Unknown",
            email=email,
            password_hash=None, # No password
            role=UserRole.STUDENT, # Default
            avatar_url=picture,
            onboarding_completed=False
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    # 3. Issue Token
    access_token = security.create_access_token(
        user.id, 
        claims={"role": user.role.value, "onboarding": user.onboarding_completed}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "needs_onboarding": not user.onboarding_completed,
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "avatar_url": user.avatar_url,
            "onboarding_completed": user.onboarding_completed
        }
    }

@router.post("/complete-profile", response_model=UserOut)
async def complete_profile(
    profile_in: OnboardingCompleteIn,
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
) -> Any:
    """
    Complete user onboarding (set role, etc.).
    """
    # Verify not already completed? Optional, maybe they want to update role?
    # Usually onboarding is one-time, but editable profile is fine.
    # However, changing role might have implications. 
    # For now, we allow it.
    
    current_user.role = profile_in.role
    
    # Security: Prevent upgrading to Admin via public endpoint
    if current_user.role == UserRole.ADMIN:
         raise HTTPException(
            status_code=403,
            detail="Cannot self-assign Admin role.",
        )
        
    current_user.onboarding_completed = True
    
    if profile_in.bio:
        current_user.bio = profile_in.bio
        
    # If company is passed (for Organisation role), we might store it in bio or a new field.
    # The Schema had 'company', model didn't. 
    # If user is ORGANISATION, we can prepend company to bio or similar.
    if profile_in.company and profile_in.role == UserRole.ORGANISATION:
        current_user.bio = f"Company: {profile_in.company}. {current_user.bio or ''}"
        
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    
    return current_user
