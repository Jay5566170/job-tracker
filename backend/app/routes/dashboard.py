from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Application


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):

    total = db.query(Application).count()

    applied = (
        db.query(Application)
        .filter(Application.status == "applied")
        .count()
    )

    interview = (
        db.query(Application)
        .filter(Application.status == "interview")
        .count()
    )

    technical = (
        db.query(Application)
        .filter(Application.status == "technical")
        .count()
    )

    offer = (
        db.query(Application)
        .filter(Application.status == "offer")
        .count()
    )

    rejected = (
        db.query(Application)
        .filter(Application.status == "rejected")
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