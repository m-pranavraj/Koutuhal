from typing import Any, Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.api import deps
from app.services.payments import payment_service
from app.models.payment import Course, Order, UserEntitlement
from app.models.user import User
from app.schemas.payment import CourseOut, CourseCreate, OrderOut, CreateOrderIn, VerifyPaymentIn, EntitlementOut
from app.core.database import get_db
import uuid

from app.core.limiter import limiter
from fastapi import Request

router = APIRouter()

@router.get("/courses", response_model=List[CourseOut])
async def read_courses(
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    List all active courses.
    """
    result = await db.execute(
        select(Course)
        .where(Course.is_active == True)
        .offset(skip)
        .limit(limit)
    )
    courses = result.scalars().all()
    return courses

@router.post("/courses/create", response_model=CourseOut)
async def create_course(
    course_in: CourseCreate,
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    Create a new course (Admin only).
    """
    from app.models.user import UserRole
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can create courses")
    
    course = Course(
        title=course_in.title,
        description=course_in.description,
        price=course_in.price,
        instructor=course_in.instructor,
        level=course_in.level,
        duration=course_in.duration,
        rating=course_in.rating,
        category=course_in.category,
        image_url=course_in.image_url,
        tags=course_in.tags,
        details=course_in.details,
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course

@router.post("/create-order", response_model=OrderOut)
@limiter.limit("5/minute")
async def create_payment_order(
    request: Request,
    order_in: CreateOrderIn,
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    Create a payment order for a course.
    """
    # 1. Fetch Course
    result = await db.execute(select(Course).where(Course.id == order_in.course_id))
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    # 2. Check if already purchased
    entitlement_result = await db.execute(
        select(UserEntitlement)
        .where(UserEntitlement.user_id == current_user.id)
        .where(UserEntitlement.course_id == order_in.course_id)
    )
    if entitlement_result.scalars().first():
        raise HTTPException(status_code=400, detail="Course already purchased")

    # 3. Create Razorpay Order
    try:
        rp_order = await payment_service.create_order(amount=course.price, currency="INR")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Payment provider error")

    # 4. Save Order to DB
    db_order = Order(
        user_id=current_user.id,
        course_id=course.id,
        amount=course.price,
        currency="INR",
        status="created",
        provider_order_id=rp_order["id"]
    )
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    
    return db_order

@router.post("/verify", status_code=200)
@limiter.limit("10/minute")
async def verify_payment(
    request: Request,
    verify_in: VerifyPaymentIn,
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    Verify payment signature and unlock course.
    """
    # 1. Fetch Order
    result = await db.execute(select(Order).where(Order.id == verify_in.order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # 2. Verify Signature
    is_valid = await payment_service.verify_payment(
        order.provider_order_id, 
        verify_in.payment_id, 
        verify_in.signature
    )
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
        
    # 3. Update Order Status
    order.status = "paid"
    db.add(order)
    
    # 4. Create Entitlement
    entitlement = UserEntitlement(
        user_id=current_user.id,
        course_id=order.course_id
    )
    db.add(entitlement)
    
    await db.commit()
    return {"status": "success", "message": "Course unlocked successfully"}

@router.get("/my-entitlements", response_model=List[EntitlementOut])
async def read_my_entitlements(
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    List user's unlocked courses.
    """
    result = await db.execute(
        select(UserEntitlement)
        .where(UserEntitlement.user_id == current_user.id)
    )
    entitlements = result.scalars().all()
    return entitlements

# Admin Seeder for Courses
@router.post("/seed-courses", status_code=201)
async def seed_courses(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(deps.require_admin)],
) -> Any:
    # Full dataset from src/data/courses.ts
    courses_data = [
        {
            "title": "Master Generative AI Bootcamp",
            "instructor": "Agrim Mehta",
            "level": "Advanced",
            "duration": "16 Weeks",
            "price": 7500000, # ₹75,000
            "rating": 4.9,
            "category": "Bootcamp",
            "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop",
            "description": "Comprehensive program covering generative AI fundamentals, tools, and production-ready applications.",
            "tags": ["LLMs", "RAG", "Agents", "Production"],
            "details": {
                "perfectFor": ["College Students", "Early Professionals", "Tech Enthusiasts"],
                "toolsList": ["OpenAI", "LangChain", "Hugging Face", "Pinecone"],
                "projectsList": ["Chat with PDF", "AI Agent", "RAG Pipeline", "Fine-tuned Model"]
            }
        },
        {
            "title": "AI Strategies for Business Growth",
            "instructor": "Shuchi",
            "level": "Intermediate",
            "duration": "8 Weeks",
            "price": 4000000, # ₹40,000
            "rating": 4.7,
            "category": "Business",
            "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop",
            "description": "Learn how to leverage AI tools and strategies to drive business growth and improve efficiency.",
            "tags": ["Strategy", "Automation", "Marketing"],
            "details": {
                "perfectFor": ["Business Owners", "Entrepreneurs", "Managers"],
                "toolsList": ["ChatGPT", "Midjourney", "Zapier"],
                "projectsList": ["Marketing Automation", "Sales Bot", "Content Strategy"]
            }
        },
        {
            "title": "Create Quizzes That Make Learning Fun",
            "instructor": "Agrim",
            "level": "Beginner",
            "duration": "Self-Paced",
            "price": 799900, # ₹7,999
            "rating": 4.8,
            "category": "AI Tools",
            "image_url": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop",
            "description": "Learn to design engaging AI-powered quizzes that transform traditional learning into interactive experiences.",
            "tags": ["Education", "Gamification", "AI"],
            "details": {
                 "perfectFor": ["Class 8-12 Students", "College Students", "Teachers"],
                 "toolsList": ["Kahoot", "Quizizz", "ChatGPT"],
                 "projectsList": ["History Quiz Bot", "Math Challenge"]
            }
        },
        {
            "title": "Build Your Personal AI Study Assistant",
            "instructor": "Neelanjana",
            "level": "Intermediate",
            "duration": "Self-Paced",
            "price": 849900,
            "rating": 4.9,
            "category": "AI Applications",
            "image_url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop",
            "description": "Create a personalized AI companion that helps with homework, explains concepts, and adapts to your learning style.",
            "tags": ["Personalization", "Study Tools"],
             "details": {
                 "perfectFor": ["Class 10-12 Students", "College Students", "Self-Learners"],
                 "toolsList": ["Notion AI", "Obsidian"],
                 "projectsList": ["Homework Helper", "Study Planner"]
            }
        },
        {
            "title": "AI Math Tutor: Never Struggle with Numbers",
            "instructor": "Agrim",
            "level": "Intermediate",
            "duration": "Self-Paced",
            "price": 899900,
            "rating": 4.9,
            "category": "Educational AI",
            "image_url": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop",
            "description": "Build an AI-powered math tutor that explains concepts step-by-step, solves problems, and adapts to your learning pace.",
            "tags": ["Math", "Tutoring"],
            "details": {
                 "perfectFor": ["Class 8-12 Students", "College Students", "Math Enthusiasts"],
                 "toolsList": ["Wolfram Alpha", "Python"],
                 "projectsList": ["Algebra Solver", "Geometry Visualizer"]
            }
        },
        {
             "title": "AI Education Program for Schools",
             "instructor": "Koutuhal Faculty",
             "level": "Beginner",
             "duration": "12 Weeks",
             "price": 0, # Request Info
             "rating": 4.8,
             "category": "Schools",
             "image_url": "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop",
             "description": "Comprehensive AI curriculum designed specifically for school students (Grades 8-12) to learn AI fundamentals.",
             "tags": ["Schools", "Curriculum"],
             "details": {
                 "perfectFor": ["Schools", "Educators", "Institution Partners"],
                 "toolsList": ["Scratch", "Teachable Machine"],
                 "projectsList": ["School AI Club", "Science Fair Project"]
            }
        },
        {
            "title": "AI-Powered Presentation Magic",
            "instructor": "Shuchi",
            "level": "Beginner",
            "duration": "Self-Paced",
            "price": 925000,
            "rating": 4.7,
            "category": "Creative AI",
            "image_url": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop",
            "description": "Transform boring presentations into captivating visual stories using AI tools.",
            "tags": ["Design", "Presentation", "Storytelling"],
            "details": {
                 "perfectFor": ["Class 8-12 Students", "College Students", "Professionals"],
                 "toolsList": ["Gamma", "Canva", "Tome"],
                 "projectsList": ["Startup Pitch Deck", "School Project Presentation"]
            }
        },
        {
            "title": "AI Language Learning Companion",
            "instructor": "Neelanjana",
            "level": "Advanced",
            "duration": "Self-Paced",
            "price": 1049900,
            "rating": 4.8,
            "category": "Language AI",
            "image_url": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop",
            "description": "Create an intelligent language learning assistant that provides personalized lessons.",
            "tags": ["Language", "NLP"],
            "details": {
                 "perfectFor": ["College Students", "Language Learners", "Travelers"],
                 "toolsList": ["Duolingo Max", "Whisper"],
                 "projectsList": ["Translation Bot", "Pronunciation Coach"]
            }
        },
         {
            "title": "AI Career Counselor: Find Your Perfect Path",
            "instructor": "Shuchi",
            "level": "Beginner",
            "duration": "Self-Paced",
            "price": 0, # Free
            "rating": 4.6,
            "category": "Career AI",
            "image_url": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop",
            "description": "Develop an AI system that analyzes skills, interests, and market trends to provide personalized career guidance.",
            "tags": ["Career", "Guidance"],
            "details": {
                 "perfectFor": ["Class 11-12 Students", "College Students", "Career Changers"],
                 "toolsList": ["LinkedIn AI", "Resume Worded"],
                 "projectsList": ["Career Roadmap Generator", "Interview Prep Bot"]
            }
        },
    ]
    
    # Clear existing courses? Maybe not. Just add new ones or update if title exists.
    # For simplicity, we just add. Constraint violations will happen if title is unique? It's not.
    # We should probably clear or check.
    
    # Better: Check if title exists, if so, update.
    
    created_count = 0
    updated_count = 0
    
    for data in courses_data:
        result = await db.execute(select(Course).where(Course.title == data["title"]))
        existing = result.scalars().first()
        
        if existing:
            # Update existing fields
            existing.price = data["price"]
            existing.instructor = data["instructor"]
            existing.level = data["level"]
            existing.image_url = data["image_url"]
            existing.description = data["description"]
            existing.tags = data.get("tags", [])
            existing.details = data.get("details", {})
            existing.rating = data.get("rating", 0.0)
            db.add(existing)
            updated_count += 1
        else:
            course = Course(**data)
            db.add(course)
            created_count += 1
    
    await db.commit()
    return {"message": f"Seeded: {created_count} new, {updated_count} updated."}
