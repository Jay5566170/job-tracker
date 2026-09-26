# app/schemas.py

from pydantic import BaseModel, EmailStr, Field, HttpUrl
from typing import List, Literal, Optional
from datetime import datetime

# ============ AUTH SCHEMAS ============
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# ============ JOB SCHEMAS ============
class JobCreate(BaseModel):
    company: str = Field(min_length=1, max_length=100)
    role: str = Field(min_length=1, max_length=100)
    url: Optional[str] = Field(default=None, max_length=500)
    description: Optional[str] = None
    location: Optional[str] = Field(default=None, max_length=255)
    skills: Optional[str] = None
    requirements: Optional[str] = None

class JobResponse(BaseModel):
    id: int
    user_id: int       # ← ADD THIS
    company: str
    role: str
    url: Optional[str]
    description: Optional[str]
    location: Optional[str]
    skills: Optional[str]
    requirements: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============ RESUME SCHEMAS ============
class ResumeResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    file_path: str
    skills: Optional[str]
    extraction_error: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============ APPLICATION SCHEMAS ============
ApplicationStatus = Literal["saved", "applied", "interview", "technical", "offer", "rejected"]


class ApplicationCreate(BaseModel):
    job_id: int
    resume_id: Optional[int] = None
    status: ApplicationStatus = "applied"
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    resume_id: Optional[int]
    status: ApplicationStatus
    applied_date: datetime
    notes: Optional[str]
    
    class Config:
        from_attributes = True


# ============ MATCH SCHEMAS ============
class MatchResult(BaseModel):
    match_score: int
    matching_skills: List[str]
    missing_skills: List[str]
    recommendation: str


# ============ PARSING SCHEMAS ============
class ParseURLRequest(BaseModel):
    url: HttpUrl


class ParseTextRequest(BaseModel):
    text: str


class ParsedJob(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    location: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    requirements: List[str] = Field(default_factory=list)