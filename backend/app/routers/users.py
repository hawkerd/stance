from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.database.user import read_user, delete_user
from app.routers.models import UserReadResponse, UserDeleteResponse, StanceFeedResponse, StanceFeedUser, StanceFeedStance
from typing import List, Optional
import logging

router = APIRouter(tags=["users"], prefix="/users")

@router.get("/me", response_model=UserReadResponse)
def get_current_user_endpoint(db: Session = Depends(get_db), current_user: int = Depends(get_current_user)) -> UserReadResponse:
    user = read_user(db, user_id=current_user)
    if not user:
        logging.error(f"User not found: {current_user}")
        raise HTTPException(status_code=404, detail="User not found")
    return UserReadResponse(id=user.id, username=user.username, full_name=user.full_name, email=user.email)

@router.get("/{user_id}", response_model=UserReadResponse)
def get_user_endpoint(user_id: int, db: Session = Depends(get_db)) -> UserReadResponse:
    user = read_user(db, user_id=user_id)
    if not user:
        logging.error(f"User not found: {user_id}")
        raise HTTPException(status_code=404, detail="User not found")
    return UserReadResponse(id=user.id, username=user.username, full_name=user.full_name, email=user.email)

@router.delete("/{user_id}", response_model=UserDeleteResponse)
def delete_user_endpoint(user_id: int, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)) -> UserDeleteResponse:
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user")
    success = delete_user(db, user_id=user_id)
    if not success:
        logging.error(f"Failed to delete user: {user_id}")
        raise HTTPException(status_code=400, detail="Failed to delete user")
    return UserDeleteResponse(success=True)
    

# @router.get("/{user_id}/stances", response_model=StanceFeedResponse)
# def get_stances_by_entity_paginated_endpoint():
#     pass