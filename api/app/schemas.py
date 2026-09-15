from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=2, max_length=120)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class HospitalsListResponse(BaseModel):
    updated_at: str
    count: int
    hospitals: list[dict]


class CoursesResponse(BaseModel):
    updated_at: str
    tracks: list[dict]


class ProductsResponse(BaseModel):
    updated_at: str
    categories: list[dict]


class ProgressUpsert(BaseModel):
    completed: bool = True
    quiz_passed: bool = False
    score: int = 0


class ProgressItem(BaseModel):
    track_id: str
    chapter_id: str
    completed: bool
    quiz_passed: bool
    score: int
    completed_at: datetime


class ProgressResponse(BaseModel):
    tracks: dict[str, dict[str, ProgressItem]]
