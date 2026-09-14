# app/routes/matches.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import MatchResult
from app.services.match_service import match_resume_to_job_service
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/matches", tags=["matches"])


@router.post("/{resume_id}/{job_id}", response_model=MatchResult)
def match_resume_to_job_endpoint(
    resume_id: int,
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Match a resume to a job using AI."""
    return match_resume_to_job_service(db, resume_id, job_id, current_user.id)