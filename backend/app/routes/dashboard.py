from fastapi import APIRouter, Depends
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

    total = db.query(Job).filter(Job.user_id == current_user.id).count()

    applied = (
        db.query(Application)
        .filter(
            Application.user_id == current_user.id,
            Application.status == "applied",
        )
        .count()
    )

    interview = (
        db.query(Application)
        .filter(
            Application.user_id == current_user.id,
            Application.status == "interview",
        )
        .count()
    )

    technical = (
        db.query(Application)
        .filter(
            Application.user_id == current_user.id,
            Application.status == "technical",
        )
        .count()
    )

    offer = (
        db.query(Application)
        .filter(
            Application.user_id == current_user.id,
            Application.status == "offer",
        )
        .count()
    )

    rejected = (
        db.query(Application)
        .filter(
            Application.user_id == current_user.id,
            Application.status == "rejected",
        )
        .count()
    )

    return {
        "total": total,
        "applied": applied,
        "interview": interview,
        "technical": technical,
        "offer": offer,
        "rejected": rejected
    }