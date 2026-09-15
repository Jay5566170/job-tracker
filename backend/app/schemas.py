# app/schemas.py

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from typing import Optional, List

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
    company: str
    role: str
    url: Optional[str] = None
    description: Optional[str] = None

class JobResponse(BaseModel):
    id: int
    user_id: int       # ← ADD THIS
    company: str
    role: str
    url: Optional[str]
    description: Optional[str]
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
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============ APPLICATION SCHEMAS ============
class ApplicationCreate(BaseModel):
    job_id: int
    resume_id: Optional[int] = None
    status: str = "applied"
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    resume_id: Optional[int]
    status: str
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
    url: str


class ParseTextRequest(BaseModel):
    text: str


class ParsedJob(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None