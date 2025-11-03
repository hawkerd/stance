from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.dependencies import *
from app.database.models import *
from app.database import (
    user as user_db,
    demographic as demographic_db,
    profile as profile_db,
    stance as stance_db,
)
from .models import *
from .dependencies import *

router = APIRouter(tags=["users"], prefix="/users")

@router.get("/me", response_model=UserReadResponse)
def get_current_user_endpoint(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
) -> UserReadResponse:
    try:
        user: User = user_db.read_user(db, user_id=current_user)
        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found")
        return UserReadResponse(id=user.id, username=user.username, full_name=user.full_name, email=user.email)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching current user: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.get("/{user_id}", response_model=UserReadResponse)
def get_user_endpoint(
    db: Session = Depends(get_db),
    user: User = Depends(validate_user)
) -> UserReadResponse:
    try:
        return UserReadResponse(id=user.id, username=user.username, full_name=user.full_name, email=user.email)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching user {user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_endpoint(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
    user: User = Depends(validate_user)
) -> None:
    try:
        if user.id != current_user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this user")
        success: bool = user_db.delete_user(db, user_id=user.id)
        if not success:
            logging.error(f"Failed to delete user: {user.id}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to delete user")
        return
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting user {user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
    
@router.post("/{user_id}/demographics", response_model=DemographicReadResponse)
def create_demographic_endpoint(
    request: DemographicCreateRequest,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
    user: User = Depends(validate_user)
) -> DemographicReadResponse:
    try:
        logging.info(f"Creating demographic for user {user.id} with data {request.model_dump()}")

        if user.id != current_user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create demographic for this user")

        # read existing demographic to prevent duplicates
        existing_demographic: Optional[Demographic] = demographic_db.get_demographic_by_user_id(db, user_id=user.id)
        if existing_demographic:
            logging.warning(f"User {user.id} already has a demographic")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already has a demographic")

        demographic: Demographic = demographic_db.create_demographic(db, user_id=user.id, birth_year=request.birth_year, gender=request.gender, zip_code=request.zip_code)
        return DemographicReadResponse(user_id=demographic.user_id, birth_year=demographic.birth_year, gender=demographic.gender, zip_code=demographic.zip_code)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.get("/{user_id}/demographics", response_model=DemographicReadResponse)
def get_demographic_endpoint(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
    user: User = Depends(validate_user)
) -> DemographicReadResponse:
    try:
        logging.info(f"Fetching demographic for user {user.id}")

        if user.id != current_user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this user's demographic")

        demographic: Optional[Demographic] = demographic_db.get_demographic_by_user_id(db, user_id=user.id)
        if not demographic:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demographic not found")
        return DemographicReadResponse(user_id=demographic.user_id, birth_year=demographic.birth_year, gender=demographic.gender, zip_code=demographic.zip_code)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching demographic for user {user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.put("/{user_id}/demographics", response_model=DemographicUpdateResponse)
def update_demographic_endpoint(
    request: DemographicUpdateRequest,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
    user: User = Depends(validate_user)
) -> DemographicUpdateResponse:
    try:
        logging.info(f"Updating demographic for user {user.id} with data {request.model_dump()}")

        if user.id != current_user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this user's demographic")

        existing_demographic: Optional[Demographic] = demographic_db.get_demographic_by_user_id(db, user_id=user.id)
        if not existing_demographic:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demographic not found")

        demographic: Optional[Demographic] = demographic_db.update_demographic(db, demographic_id=existing_demographic.id, **request.model_dump())
        if not demographic:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update demographic")
        return DemographicUpdateResponse(user_id=demographic.user_id, birth_year=demographic.birth_year, gender=demographic.gender, zip_code=demographic.zip_code)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating demographic for user {user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
    
@router.post("/{user_id}/profile", response_model=ProfileReadResponse)
def create_profile_endpoint(
    request: ProfileCreateRequest,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
    user: User = Depends(validate_user)
) -> ProfileReadResponse:
    try:
        logging.info(f"Creating profile for user {user.id} with data {request.model_dump()}")
        if user.id != current_user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create profile for this user")
        existing_profile: Optional[Profile] = profile_db.get_profile_by_user_id(db, user_id=user.id)
        if existing_profile:
            logging.warning(f"User {user.id} already has a profile")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already has a profile")
        profile = profile_db.create_profile(db, user_id=user.id, bio=request.bio, avatar_url=request.avatar_url, pinned_stance_id=request.pinned_stance_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create profile")
        return ProfileReadResponse(user_id=profile.user_id, bio=profile.bio, avatar_url=profile.avatar_url, pinned_stance_id=profile.pinned_stance_id)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating profile for user {user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.get("/{user_id}/profile", response_model=ProfileReadResponse)
def get_profile_endpoint(
    db: Session = Depends(get_db),
    user: User = Depends(validate_user)
) -> ProfileReadResponse:
    try:
        logging.info(f"Fetching profile for user {user.id}")
        profile = profile_db.get_profile_by_user_id(db, user_id=user.id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
        return ProfileReadResponse(user_id=profile.user_id, bio=profile.bio, avatar_url=profile.avatar_url, pinned_stance_id=profile.pinned_stance_id)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching profile for user {user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
    
@router.put("/{user_id}/profile", response_model=ProfileUpdateResponse)
def update_profile_endpoint(
    request: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
    user: User = Depends(validate_user)
) -> ProfileUpdateResponse:
    try:
        logging.info(f"Updating profile for user {user.id} with data {request.model_dump()}")
        if user.id != current_user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this user's profile")
        existing_profile = profile_db.get_profile_by_user_id(db, user_id=user.id)
        if not existing_profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
        profile = profile_db.update_profile(db, profile_id=existing_profile.id, **request.model_dump())
        if not profile:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update profile")
        return ProfileUpdateResponse(user_id=profile.user_id, bio=profile.bio, avatar_url=profile.avatar_url, pinned_stance_id=profile.pinned_stance_id)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating profile for user {user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.get("/{user_id}/profile_page", response_model=ProfilePageResponse)
def get_profile_page_endpoint(
    db: Session = Depends(get_db),
    user: User = Depends(validate_user)
) -> ProfilePageResponse:
    try:
        logging.info(f"Fetching profile page for user {user.id}")
        
        profile: Optional[Profile] = profile_db.get_profile_by_user_id(db, user_id=user.id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
        
        entity_id: Optional[int] = None
        if profile.pinned_stance_id:
            pinned_stance: Optional[Stance] = stance_db.read_stance(db, stance_id=profile.pinned_stance_id)
            if pinned_stance:
                entity_id = pinned_stance.entity_id

        return ProfilePageResponse(username=user.username, bio=profile.bio, avatar_url=profile.avatar_url, pinned_stance_id=profile.pinned_stance_id, pinned_stance_id_entity_id=entity_id)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching profile page for user {user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
