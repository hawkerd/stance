from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.database.profile import create_profile, get_profile_by_user_id, update_profile
from app.routers.models.profiles import ProfileCreateRequest, ProfileReadResponse, ProfileUpdateRequest, ProfileUpdateResponse
import logging

router = APIRouter(tags=["users"])

@router.post("/users/{user_id}/profile", response_model=ProfileReadResponse)
def create_profile_endpoint(request: ProfileCreateRequest, user_id: int, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)) -> ProfileReadResponse:
    try:
        logging.info(f"Creating profile for user {user_id} with data {request.model_dump()}")
        if user_id != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to create profile for this user")
        existing_profile = get_profile_by_user_id(db, user_id=user_id)
        if existing_profile:
            logging.warning(f"User {user_id} already has a profile")
            raise HTTPException(status_code=400, detail="User already has a profile")
        profile = create_profile(db, user_id=user_id, bio=request.bio, avatar_url=request.avatar_url, pinned_stance_id=request.pinned_stance_id)
        if not profile:
            raise HTTPException(status_code=400, detail="Failed to create profile")
        return ProfileReadResponse(user_id=profile.user_id, bio=profile.bio, avatar_url=profile.avatar_url, pinned_stance_id=profile.pinned_stance_id)
    except Exception as e:
        logging.error(f"Error creating profile for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/users/{user_id}/profile", response_model=ProfileReadResponse)
def get_profile_endpoint(user_id: int, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)) -> ProfileReadResponse:
    try:
        logging.info(f"Fetching profile for user {user_id}")
        if user_id != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to view this user's profile")
        profile = get_profile_by_user_id(db, user_id=user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return ProfileReadResponse(user_id=profile.user_id, bio=profile.bio, avatar_url=profile.avatar_url, pinned_stance_id=profile.pinned_stance_id)
    except Exception as e:
        logging.error(f"Error fetching profile for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/users/{user_id}/profile", response_model=ProfileUpdateResponse)
def update_profile_endpoint(request: ProfileUpdateRequest, user_id: int, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)) -> ProfileUpdateResponse:
    try:
        logging.info(f"Updating profile for user {user_id} with data {request.model_dump()}")
        if user_id != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to update this user's profile")
        existing_profile = get_profile_by_user_id(db, user_id=user_id)
        if not existing_profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        profile = update_profile(db, profile_id=existing_profile.id, **request.model_dump())
        if not profile:
            raise HTTPException(status_code=400, detail="Failed to update profile")
        return ProfileUpdateResponse(user_id=profile.user_id, bio=profile.bio, avatar_url=profile.avatar_url, pinned_stance_id=profile.pinned_stance_id)
    except Exception as e:
        logging.error(f"Error updating profile for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
