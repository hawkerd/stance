from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.database.service.user import read_user as db_read_user
from app.routers.models.users import UserReadResponse
import logging

router = APIRouter()

@router.post("/users/me", response_model=UserReadResponse)
def get_user(db: Session = Depends(get_db), current_user: int = Depends(get_current_user)) -> UserReadResponse:
    user = db_read_user(db, user_id=current_user)
    if not user:
        logging.error(f"User not found: {current_user}")
        raise HTTPException(status_code=404, detail="User not found")
    return UserReadResponse(id=user.id, username=user.username, full_name=user.full_name, bio=user.bio, email=user.email)
