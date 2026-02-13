from pydantic import BaseModel
from uuid import UUID
from typing import Optional, List, Dict
from datetime import datetime

class CourseOut(BaseModel):
    id: UUID
    title: str
    description: str
    price: int
    is_active: bool
    
    instructor: Optional[str] = None
    level: Optional[str] = None
    duration: Optional[str] = None
    rating: Optional[float] = 0.0
    category: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[list[str]] = []
    details: Optional[dict] = {}
    
    created_at: datetime
    
    class Config:
        from_attributes = True

class CourseCreate(BaseModel):
    title: str
    description: str
    price: int
    instructor: Optional[str] = None
    level: Optional[str] = "Beginner"
    duration: Optional[str] = None
    rating: Optional[float] = 0.0
    category: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[list[str]] = []
    details: Optional[dict] = {}

class CreateOrderIn(BaseModel):
    course_id: UUID

class OrderOut(BaseModel):
    id: UUID
    provider_order_id: str
    amount: int
    currency: str
    status: str

class VerifyPaymentIn(BaseModel):
    order_id: UUID
    payment_id: str
    signature: str

class EntitlementOut(BaseModel):
    id: UUID
    course_id: UUID
    unlocked_at: datetime

    class Config:
        from_attributes = True
