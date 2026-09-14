# app/routes/applications.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from app.services.application_service import (
    get_user_applications,
    get_application_by_id,
    create_application,
    update_application,
    delete_application,
)
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_new_application(
    app_data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new application."""
    return create_application(db, app_data, current_user.id)


@router.get("/", response_model=List[ApplicationResponse])
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all applications for the current user."""
    return get_user_applications(db, current_user.id)


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_one_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific application."""
    return get_application_by_id(db, application_id, current_user.id)


@router.put("/{application_id}", response_model=ApplicationResponse)
def update_one_application(
    application_id: int,
    app_data: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an application's status or notes."""
    return update_application(db, application_id, app_data, current_user.id)


@router.delete("/{application_id}")
def delete_one_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an application."""
    return delete_application(db, application_id, current_user.id)