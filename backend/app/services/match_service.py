# app/services/match_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models import Resume, Job
from app.services.ai_service import match_resume_to_job


def match_resume_to_job_service(db: Session, resume_id: int, job_id: int, user_id: int):
    """Match a resume to a job using AI."""
    
    # Get resume (verify ownership)
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user_id
    ).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Get job (verify ownership)
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == user_id
    ).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Get resume skills
    resume_skills = resume.skills or "[]"
    
    # Get job description
    job_description = job.description or ""
    
    # Match using AI
    match_result = match_resume_to_job(resume_skills, job_description)
    
    return match_result