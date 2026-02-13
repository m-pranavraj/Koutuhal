from typing import Any, Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
import uuid

from app.api import deps
from app.models.user import User, UserRole
from app.models.mentor_session import MentorSession
from app.core.database import get_db

router = APIRouter()

# --- Schemas ---

class MentorOut(BaseModel):
    id: uuid.UUID
    name: str
    bio: str | None = None
    avatar_url: str | None = None
    xp_points: int = 0
    
    class Config:
        from_attributes = True

class BookSessionIn(BaseModel):
    mentor_id: uuid.UUID
    session_type: str = "call"  # "call" or "dm"
    message: str = ""

class SessionOut(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    mentor_id: uuid.UUID
    status: str
    session_type: str
    message: str | None
    mentor_reply: str | None
    created_at: Any
    student_name: str | None = None
    mentor_name: str | None = None

    class Config:
        from_attributes = True

class ReplySessionIn(BaseModel):
    reply: str
    action: str = "ACCEPTED"  # ACCEPTED or DECLINED

# --- Routes ---

@router.get("/", response_model=List[MentorOut])
async def list_mentors(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """List all users with MENTOR role (public)."""
    result = await db.execute(
        select(User).where(User.role == UserRole.MENTOR)
    )
    return result.scalars().all()

@router.get("/{mentor_id}", response_model=MentorOut)
async def get_mentor(
    mentor_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """Get mentor profile by ID."""
    result = await db.execute(select(User).where(User.id == mentor_id, User.role == UserRole.MENTOR))
    mentor = result.scalars().first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    return mentor

@router.post("/book", response_model=SessionOut)
async def book_session(
    booking: BookSessionIn,
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """Book a session or send a DM to a mentor."""
    # Verify mentor exists
    result = await db.execute(select(User).where(User.id == booking.mentor_id, User.role == UserRole.MENTOR))
    mentor = result.scalars().first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    if mentor.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot book a session with yourself")
    
    session = MentorSession(
        student_id=current_user.id,
        mentor_id=booking.mentor_id,
        session_type=booking.session_type,
        message=booking.message,
        status="PENDING"
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return SessionOut(
        id=session.id,
        student_id=session.student_id,
        mentor_id=session.mentor_id,
        status=session.status,
        session_type=session.session_type,
        message=session.message,
        mentor_reply=session.mentor_reply,
        created_at=session.created_at,
        student_name=current_user.name,
        mentor_name=mentor.name,
    )

@router.get("/sessions/my", response_model=List[SessionOut])
async def my_sessions(
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """Get all sessions where I am a student or mentor."""
    result = await db.execute(
        select(MentorSession)
        .where(
            (MentorSession.student_id == current_user.id) | 
            (MentorSession.mentor_id == current_user.id)
        )
        .order_by(desc(MentorSession.created_at))
    )
    sessions = result.scalars().all()
    
    out = []
    for s in sessions:
        # Fetch names
        student = await db.get(User, s.student_id)
        mentor = await db.get(User, s.mentor_id)
        out.append(SessionOut(
            id=s.id,
            student_id=s.student_id,
            mentor_id=s.mentor_id,
            status=s.status,
            session_type=s.session_type,
            message=s.message,
            mentor_reply=s.mentor_reply,
            created_at=s.created_at,
            student_name=student.name if student else None,
            mentor_name=mentor.name if mentor else None,
        ))
    return out

@router.get("/sessions/requests", response_model=List[SessionOut])
async def mentor_requests(
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """Get pending requests for a mentor."""
    result = await db.execute(
        select(MentorSession)
        .where(MentorSession.mentor_id == current_user.id)
        .where(MentorSession.status == "PENDING")
        .order_by(desc(MentorSession.created_at))
    )
    sessions = result.scalars().all()
    
    out = []
    for s in sessions:
        student = await db.get(User, s.student_id)
        out.append(SessionOut(
            id=s.id,
            student_id=s.student_id,
            mentor_id=s.mentor_id,
            status=s.status,
            session_type=s.session_type,
            message=s.message,
            mentor_reply=s.mentor_reply,
            created_at=s.created_at,
            student_name=student.name if student else None,
            mentor_name=current_user.name,
        ))
    return out

@router.post("/sessions/{session_id}/respond", response_model=SessionOut)
async def respond_to_session(
    session_id: uuid.UUID,
    reply_in: ReplySessionIn,
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """Mentor responds to a session request (Accept/Decline)."""
    result = await db.execute(
        select(MentorSession).where(MentorSession.id == session_id)
    )
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the mentor can respond")
    
    session.status = reply_in.action
    session.mentor_reply = reply_in.reply
    await db.commit()
    await db.refresh(session)
    
    student = await db.get(User, session.student_id)
    return SessionOut(
        id=session.id,
        student_id=session.student_id,
        mentor_id=session.mentor_id,
        status=session.status,
        session_type=session.session_type,
        message=session.message,
        mentor_reply=session.mentor_reply,
        created_at=session.created_at,
        student_name=student.name if student else None,
        mentor_name=current_user.name,
    )
