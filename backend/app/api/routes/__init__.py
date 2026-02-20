from fastapi import APIRouter
from . import auth
from . import health
from . import resumes
from . import jobs
from . import applications
from . import ai
from . import dashboard
from . import payments
from . import files
from . import users
from . import admin
from . import mentors
from . import career
from . import resume

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(mentors.router, prefix="/mentors", tags=["mentors"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["resumes"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(career.router, prefix="/career", tags=["career"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(resume.router, prefix="/resume", tags=["resume"])
