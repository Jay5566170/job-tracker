# app/services/resume_service.py

import os
import shutil
import json
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile, status

from app.models import Resume
from app.utils.pdf_parser import extract_text
from app.services.ai_service import extract_resume_data


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_user_resumes(db: Session, user_id: int):
    """Get all resumes for a user."""
    return db.query(Resume).filter(Resume.user_id == user_id).all()


def get_resume_by_id(db: Session, resume_id: int, user_id: int):
    """Get a specific resume by ID (only if owned by user)."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user_id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    return resume


def upload_resume(db: Session, file: UploadFile, user_id: int):
    """Upload, save, and analyze a resume."""
    # Validate file type
    if not file.filename.lower().endswith(('.pdf', '.txt')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and TXT files allowed"
        )
    
    # Save file to disk
    timestamp = int(datetime.now().timestamp())
    file_path = os.path.join(UPLOAD_DIR, f"{timestamp}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract text
    text = extract_text(file_path)
    
    # Extract structured data with AI
    ai_data = extract_resume_data(text)
    skills_json = json.dumps(ai_data.get("skills", []))
    
    # Create DB record
    new_resume = Resume(
        user_id=user_id,
        filename=file.filename,
        file_path=file_path,
        skills=skills_json
    )
    
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    
    return new_resume


def delete_resume(db: Session, resume_id: int, user_id: int):
    """Delete a resume."""
    resume = get_resume_by_id(db, resume_id, user_id)
    
    # Delete file from disk
    if os.path.exists(resume.file_path):
        os.remove(resume.file_path)
    
    db.delete(resume)
    db.commit()
    
    return {"message": f"Resume {resume_id} deleted successfully"}