from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import ChapterProgress, User
from app.schemas import ProgressItem, ProgressResponse, ProgressUpsert

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("", response_model=ProgressResponse)
def get_progress(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProgressResponse:
    rows = db.scalars(select(ChapterProgress).where(ChapterProgress.user_id == user.id)).all()
    tracks: dict[str, dict[str, ProgressItem]] = {}
    for row in rows:
        tracks.setdefault(row.track_id, {})[row.chapter_id] = ProgressItem(
            track_id=row.track_id,
            chapter_id=row.chapter_id,
            completed=row.completed,
            quiz_passed=row.quiz_passed,
            score=row.score,
            completed_at=row.completed_at,
        )
    return ProgressResponse(tracks=tracks)


@router.put("/{track_id}/{chapter_id}", response_model=ProgressItem)
def upsert_progress(
    track_id: str,
    chapter_id: str,
    payload: ProgressUpsert,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProgressItem:
    row = db.scalar(
        select(ChapterProgress).where(
            ChapterProgress.user_id == user.id,
            ChapterProgress.track_id == track_id,
            ChapterProgress.chapter_id == chapter_id,
        )
    )
    if not row:
        row = ChapterProgress(
            user_id=user.id,
            track_id=track_id,
            chapter_id=chapter_id,
        )
        db.add(row)

    row.completed = payload.completed
    row.quiz_passed = payload.quiz_passed
    row.score = payload.score
    db.commit()
    db.refresh(row)
    return ProgressItem(
        track_id=row.track_id,
        chapter_id=row.chapter_id,
        completed=row.completed,
        quiz_passed=row.quiz_passed,
        score=row.score,
        completed_at=row.completed_at,
    )
