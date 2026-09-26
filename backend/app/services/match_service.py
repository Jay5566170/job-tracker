# app/services/match_service.py

import json

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models import Match, Resume, Job
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
    job_description = "\n".join(
        value
        for value in (
            job.role,
            job.company,
            job.location or "",
            job.description or "",
            f"Skills: {job.skills}" if job.skills else "",
            f"Requirements: {job.requirements}" if job.requirements else "",
        )
        if value
    )
    
    # Match using AI
    match_result = match_resume_to_job(resume_skills, job_description)
    
    record = Match(
        user_id=user_id,
        resume_id=resume.id,
        job_id=job.id,
        match_score=match_result["match_score"],
        matching_skills=json.dumps(match_result["matching_skills"]),
        missing_skills=json.dumps(match_result["missing_skills"]),
        recommendation=match_result["recommendation"],
    )
    db.add(record)
    db.commit()
    return match_result


def get_user_matches(db: Session, user_id: int):
    return (
        db.query(Match)
        .join(Resume, Match.resume_id == Resume.id)
        .join(Job, Match.job_id == Job.id)
        .filter(
            Match.user_id == user_id,
            Resume.user_id == user_id,
            Job.user_id == user_id,
        )
        .order_by(Match.created_at.desc())
        .all()
    )


def serialize_match(match: Match) -> dict:
    return {
        "id": match.id,
        "user_id": match.user_id,
        "resume_id": match.resume_id,
        "job_id": match.job_id,
        "match_score": match.match_score,
        "matching_skills": json.loads(match.matching_skills),
        "missing_skills": json.loads(match.missing_skills),
        "recommendation": match.recommendation,
        "created_at": match.created_at,
    }