from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.database.db import create_user as db_create_user
from app.routers.models.models import UserCreateRequest, UserCreateResponse
import logging

router = APIRouter()

@router.post("/users/")
def create_user(user: UserCreateRequest, db: Session = Depends(get_db)) -> UserCreateResponse:
    logging.info(f"Creating user: {user.username}")
    try:
        user = db_create_user(db, **user.model_dump())
        return UserCreateResponse(success=True)
    except Exception as e:
        logging.error(f"Error creating user: {e}")
        return UserCreateResponse(success=False)