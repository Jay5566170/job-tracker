# app/services/application_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import Application, Job, Resume
from app.schemas import ApplicationCreate, ApplicationUpdate


def get_user_applications(db: Session, user_id: int):
    """Get all applications for a user."""
    return db.query(Application).filter(Application.user_id == user_id).all()


def get_application_by_id(db: Session, application_id: int, user_id: int):
    """Get a specific application (only if owned by user)."""
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == user_id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    return application


def create_application(db: Session, app_data: ApplicationCreate, user_id: int):
    """Create a new application."""
    # Verify job exists and belongs to user
    job = db.query(Job).filter(Job.id == app_data.job_id, Job.user_id == user_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Verify resume exists and belongs to user (if provided)
    if app_data.resume_id:
        resume = db.query(Resume).filter(
            Resume.id == app_data.resume_id,
            Resume.user_id == user_id
        ).first()
        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
    
    # Create application
    new_app = Application(
        user_id=user_id,
        job_id=app_data.job_id,
        resume_id=app_data.resume_id,
        status=app_data.status,
        notes=app_data.notes
    )
    
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    
    return new_app


def update_application(db: Session, application_id: int, app_data: ApplicationUpdate, user_id: int):
    """Update an application's status or notes."""
    application = get_application_by_id(db, application_id, user_id)
    
    if app_data.status is not None:
        application.status = app_data.status
    if app_data.notes is not None:
        application.notes = app_data.notes
    
    db.commit()
    db.refresh(application)
    
    return application


def delete_application(db: Session, application_id: int, user_id: int):
    """Delete an application."""
    application = get_application_by_id(db, application_id, user_id)
    
    db.delete(application)
    db.commit()
    
    return {"message": f"Application {application_id} deleted successfully"}