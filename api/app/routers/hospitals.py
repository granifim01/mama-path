from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Hospital
from app.schemas import HospitalsListResponse

router = APIRouter(prefix="/hospitals", tags=["hospitals"])


@router.get("", response_model=HospitalsListResponse)
def list_hospitals(
    city: str | None = Query(default=None),
    q: str | None = Query(default=None),
    paid: bool = Query(default=False),
    free: bool = Query(default=False),
    db: Session = Depends(get_db),
) -> HospitalsListResponse:
    hospitals = db.scalars(select(Hospital).order_by(Hospital.city_slug, Hospital.name)).all()
    items = [hospital.payload for hospital in hospitals]

    if city:
        items = [item for item in items if item.get("city_slug") == city]
    if q:
        query = q.lower()
        items = [
            item
            for item in items
            if query in f"{item.get('name', '')} {item.get('address', '')}".lower()
        ]
    if paid:
        items = [item for item in items if item.get("has_paid_birth")]
    if free:
        items = [item for item in items if item.get("free_birth_available") is True]

    updated_at = hospitals[0].updated_at.isoformat() if hospitals else ""
    return HospitalsListResponse(updated_at=updated_at, count=len(items), hospitals=items)


@router.get("/{hospital_id}")
def get_hospital(hospital_id: str, db: Session = Depends(get_db)) -> dict:
    hospital = db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital.payload
