from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CourseCatalog
from app.schemas import CoursesResponse

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=CoursesResponse)
def list_courses(db: Session = Depends(get_db)) -> CoursesResponse:
    catalog = db.get(CourseCatalog, 1)
    if not catalog:
        raise HTTPException(status_code=404, detail="Courses not seeded")
    payload = catalog.payload
    return CoursesResponse(
        updated_at=payload.get("updated_at", ""),
        tracks=payload.get("tracks", []),
    )


@router.get("/{track_id}")
def get_track(track_id: str, db: Session = Depends(get_db)) -> dict:
    catalog = db.get(CourseCatalog, 1)
    if not catalog:
        raise HTTPException(status_code=404, detail="Courses not seeded")
    for track in catalog.payload.get("tracks", []):
        if track.get("id") == track_id:
            return track
    raise HTTPException(status_code=404, detail="Track not found")
