# app/routes/resumes.py

from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas import ResumeResponse
from app.services.resume_service import (
    get_user_resumes,
    get_resume_by_id,
    upload_resume,
    delete_resume,
)
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload and analyze a resume."""
    resume = upload_resume(db, file, current_user.id)
    return resume


@router.get("/", response_model=List[ResumeResponse])
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all resumes for the current user."""
    return get_user_resumes(db, current_user.id)


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_one_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific resume."""
    return get_resume_by_id(db, resume_id, current_user.id)


@router.delete("/{resume_id}")
def delete_one_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a resume."""
    return delete_resume(db, resume_id, current_user.id)