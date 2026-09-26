from fastapi import APIRouter, Depends
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Application, Job, User


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    total_jobs = db.query(Job).filter(Job.user_id == current_user.id).count()
    counts = (
        db.query(
            func.count(Application.id),
            func.sum(case((Application.status == "applied", 1), else_=0)),
            func.sum(case((Application.status == "interview", 1), else_=0)),
            func.sum(case((Application.status == "technical", 1), else_=0)),
            func.sum(case((Application.status == "offer", 1), else_=0)),
            func.sum(case((Application.status == "rejected", 1), else_=0)),
        )
        .join(Job, Application.job_id == Job.id)
        .filter(
            Application.user_id == current_user.id,
            Job.user_id == current_user.id,
        )
        .one()
    )

    return {
        "total": total_jobs,
        "applications": counts[0],
        "applied": counts[1] or 0,
        "interview": counts[2] or 0,
        "technical": counts[3] or 0,
        "offer": counts[4] or 0,
        "rejected": counts[5] or 0,
    }