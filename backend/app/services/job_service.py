# app/services/job_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import Job, User
from app.schemas import JobCreate


def get_user_jobs(db: Session, user_id: int):
    """Get all jobs for a specific user."""
    return db.query(Job).filter(Job.user_id == user_id).all()


def get_job_by_id(db: Session, job_id: int, user_id: int):
    """Get a specific job by ID (only if owned by user)."""
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == user_id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    return job


def create_job(db: Session, job_data: JobCreate, user_id: int):
    """Create a new job for a user."""
    new_job = Job(
        user_id=user_id,
        company=job_data.company,
        role=job_data.role,
        url=job_data.url,
        description=job_data.description
    )
    
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    
    return new_job


def delete_job(db: Session, job_id: int, user_id: int):
    """Delete a job (only if owned by user)."""
    job = get_job_by_id(db, job_id, user_id)
    
    db.delete(job)
    db.commit()
    
    return {"message": f"Job {job_id} deleted successfully"}