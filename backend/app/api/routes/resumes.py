from typing import Any, Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.api import deps
from app.models.resume import Resume
from app.models.user import User
from app.schemas.resume import ResumeCreate, ResumeUpdate, ResumeOut
from app.core.database import get_db
import uuid

router = APIRouter()

@router.get("/", response_model=List[ResumeOut])
async def read_resumes(
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all resumes for current user.
    """
    result = await db.execute(
        select(Resume)
        .where(Resume.user_id == current_user.id)
        .order_by(desc(Resume.updated_at))
        .offset(skip)
        .limit(limit)
    )
    resumes = result.scalars().all()
    return resumes

@router.get("/latest", response_model=ResumeOut)
async def read_latest_resume(
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    Retrieve the most recently updated resume.
    """
    result = await db.execute(
        select(Resume)
        .where(Resume.user_id == current_user.id)
        .order_by(desc(Resume.updated_at))
        .limit(1)
    )
    resume = result.scalars().first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resumes found")
    return resume

@router.post("/", response_model=ResumeOut)
async def create_resume(
    *,
    db: Annotated[AsyncSession, Depends(get_db)],
    resume_in: ResumeCreate,
    current_user: Annotated[User, Depends(deps.get_current_user)],
) -> Any:
    """
    Create new resume.
    """
    resume = Resume(
        user_id=current_user.id,
        title=resume_in.title,
        content=resume_in.content,
        template_id=resume_in.template_id
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return resume

@router.get("/{id}", response_model=ResumeOut)
async def read_resume(
    id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(deps.get_current_user)],
) -> Any:
    """
    Get resume by ID.
    """
    result = await db.execute(select(Resume).where(Resume.id == id))
    resume = result.scalars().first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if resume.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return resume

@router.put("/{id}", response_model=ResumeOut)
async def update_resume(
    id: uuid.UUID,
    resume_in: ResumeUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(deps.get_current_user)],
) -> Any:
    """
    Update a resume.
    """
    result = await db.execute(select(Resume).where(Resume.id == id))
    resume = result.scalars().first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if resume.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_data = resume_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(resume, field, value)
    
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return resume

@router.delete("/{id}", response_model=ResumeOut)
async def delete_resume(
    id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(deps.get_current_user)],
) -> Any:
    """
    Delete a resume.
    """
    result = await db.execute(select(Resume).where(Resume.id == id))
    resume = result.scalars().first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if resume.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    await db.delete(resume)
    await db.commit()
    return resume
