# app/routes/jobs.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import JobCreate, JobResponse
from app.services.job_service import (
    get_user_jobs,
    get_job_by_id,
    create_job,
    delete_job,
)
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_new_job(
    job_data: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new job application."""
    job = create_job(db, job_data, current_user.id)
    return job


@router.get("/", response_model=List[JobResponse])
def list_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all jobs for the current user."""
    jobs = get_user_jobs(db, current_user.id)
    return jobs


@router.get("/{job_id}", response_model=JobResponse)
def get_one_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific job by ID."""
    job = get_job_by_id(db, job_id, current_user.id)
    return job


@router.delete("/{job_id}")
def delete_one_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a job."""
    return delete_job(db, job_id, current_user.id)