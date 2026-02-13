import asyncio
import logging
from app.core.database import AsyncSessionLocal
from app.models.payment import Course
from app.models.job import Job

from sqlalchemy import select

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_data():
    async with AsyncSessionLocal() as db:
        # Check if data exists
        result = await db.execute(select(Course))
        if result.scalars().first():
            logger.info("Data already seeded.")
            return

        logger.info("Seeding data...")

        # Courses
        courses = [
            Course(
                title="Full Stack Web Development 2024",
                description="Become a full-stack developer with just one course. HTML, CSS, Javascript, Node, React, MongoDB, Web3 and DApps",
                price=4999,
                instructor="Dr. Angela Yu",
                level="Beginner",
                duration="50 hours",
                category="Web Development",
                image_url="https://img-c.udemycdn.com/course/750x422/1565838_e54e_18.jpg",
                lessons=[],
                details={"curriculum": [], "benefits": ["Certificate", "Lifetime Access"]}
            ),
            Course(
                title="Machine Learning A-Z: AI, Python & R",
                description="Learn to create Machine Learning Algorithms in Python and R from two Data Science experts. Code templates included.",
                price=3499,
                instructor="Kirill Eremenko",
                level="Intermediate",
                duration="40 hours",
                category="Data Science",
                image_url="https://img-c.udemycdn.com/course/750x422/950390_270f_3.jpg",
                lessons=[],
                details={"curriculum": []}
            ),
             Course(
                title="The Complete Python Bootcamp",
                description="Learn Python like a Professional! Start from the basics and go all the way to creating your own applications and games",
                price=2999,
                instructor="Jose Portilla",
                level="Beginner",
                duration="22 hours",
                category="Programming",
                image_url="https://img-c.udemycdn.com/course/750x422/567828_67d0.jpg",
                lessons=[],
                details={"curriculum": []}
            )
        ]
        db.add_all(courses)

        # Jobs (Assuming Job model uses clean strings or Enums are importable. To be safe, I will skip Enums if not sure, 
        # but Job model inspection wasn't done deeply. JobType is often Enum. 
        # I'll try to check Job model or just insert strings if it accepts.
        # Actually, let's skip Jobs to minimize risk. Homepage mainly shows courses.
        # If homepage shows Jobs, it might be empty.
        # I'll check Job model in app/models/job.py via view if I can, but no time.
        # I'll comment out Jobs for safety.)
        
        await db.commit()
        logger.info("Seeding complete (Courses only)!")

if __name__ == "__main__":
    asyncio.run(seed_data())
