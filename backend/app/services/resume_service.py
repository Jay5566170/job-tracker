# app/services/resume_service.py

import json
import shutil
from pathlib import Path
from uuid import uuid4
import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile, status

from app.models import Application, Resume
from app.utils.pdf_parser import extract_text
from app.services.ai_service import extract_resume_data


BACKEND_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BACKEND_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
logger = logging.getLogger(__name__)


def get_resume_file_path(resume: Resume) -> Path:
    stored_path = str(resume.file_path).replace("\\", "/")
    return UPLOAD_DIR / Path(stored_path).name


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
    original_filename = Path((file.filename or "").replace("\\", "/")).name
    if not original_filename.lower().endswith((".pdf", ".txt")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and TXT files allowed"
        )
    
    stored_filename = f"{uuid4().hex}_{original_filename}"
    file_path = UPLOAD_DIR / stored_filename
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        text = extract_text(str(file_path))
        extraction_error = None
        try:
            ai_data = extract_resume_data(text)
            skills_json = json.dumps(ai_data["skills"])
        except HTTPException as error:
            skills_json = json.dumps([])
            extraction_error = error.detail

        new_resume = Resume(
            user_id=user_id,
            filename=original_filename,
            file_path=stored_filename,
            skills=skills_json,
            extraction_error=extraction_error,
        )
        db.add(new_resume)
        db.commit()
        db.refresh(new_resume)
        return new_resume
    except Exception:
        db.rollback()
        file_path.unlink(missing_ok=True)
        raise


def delete_resume(db: Session, resume_id: int, user_id: int):
    """Delete a resume."""
    resume = get_resume_by_id(db, resume_id, user_id)
    file_path = get_resume_file_path(resume)
    db.query(Application).filter(
        Application.user_id == user_id,
        Application.resume_id == resume.id,
    ).update({Application.resume_id: None}, synchronize_session=False)
    db.delete(resume)
    db.commit()
    try:
        file_path.unlink(missing_ok=True)
    except OSError:
        logger.exception("Resume %s was deleted from the database but its file could not be removed.", resume_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Resume record was deleted, but its uploaded file could not be removed. Contact support.",
        )
    return {"message": f"Resume {resume_id} deleted successfully"}