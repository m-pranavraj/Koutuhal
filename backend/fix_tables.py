"""Create mentor_sessions table."""
import asyncio
from app.core.database import engine, Base
from app.models.mentor_session import MentorSession

async def create():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("mentor_sessions table created!")

asyncio.run(create())
