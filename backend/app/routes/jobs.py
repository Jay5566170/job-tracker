# app/routes/jobs.py

from fastapi import APIRouter, Depends, HTTPException, status
import logging
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
logger = logging.getLogger(__name__)


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

from app.schemas import ParseURLRequest, ParseTextRequest, ParsedJob
from app.utils.url_fetcher import fetch_job_page
from app.services.ai_service import parse_job_description


@router.post("/parse-url", response_model=ParsedJob)
def parse_job_from_url(
    data: ParseURLRequest,
    current_user: User = Depends(get_current_user)
):
    """Parse a job from a URL."""
    logger.info("Parsing job posting URL host=%s", data.url.host)
    # Fetch content from URL
    page = fetch_job_page(str(data.url))
    if page.structured_job:
        parsed = page.structured_job
    elif len(page.text.strip()) >= 50:
        parsed = parse_job_description(page.text)
    else:
        raise HTTPException(
            status_code=422,
            detail="The URL did not contain enough readable job text. Paste the job description instead.",
        )
    parsed["url"] = str(data.url)
    logger.info("Parsed job URL with company/title present: %s/%s", bool(parsed.get("company")), bool(parsed.get("title")))
    return parsed


@router.post("/parse-text", response_model=ParsedJob)
def parse_job_from_text(
    data: ParseTextRequest,
    current_user: User = Depends(get_current_user)
):
    """Parse a job from pasted text."""
    logger.info("Parsing pasted job text (%d characters)", len(data.text))
    parsed = parse_job_description(data.text)
    logger.info("Parsed pasted job text with company/title present: %s/%s", bool(parsed.get("company")), bool(parsed.get("title")))
    return parsed