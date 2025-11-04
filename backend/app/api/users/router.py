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
    follow as follow_db
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
    user: User = Depends(validate_user),
    current_user: Optional[int] = Depends(get_current_user_optional)
) -> ProfilePageResponse:
    try:
        logging.info(f"Fetching profile page for user {user.id}")
        
        profile: Optional[Profile] = profile_db.get_profile_by_user_id(db, user_id=user.id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
        
        followers_count: int = len(user.followers)
        following_count: int = len(user.following)
        following: Optional[bool] = None
        if current_user:
            following = follow_db.find_follow(db, follower_id=current_user, followed_id=user.id) is not None
        entity_id: Optional[int] = None
        if profile.pinned_stance_id:
            pinned_stance: Optional[Stance] = stance_db.read_stance(db, stance_id=profile.pinned_stance_id)
            if pinned_stance:
                entity_id = pinned_stance.entity_id

        return ProfilePageResponse(
            username=user.username,
            full_name=user.full_name,
            follower_count=followers_count,
            following_count=following_count,
            following=following,
            bio=profile.bio,
            avatar_url=profile.avatar_url,
            pinned_stance_id=profile.pinned_stance_id,
            pinned_stance_id_entity_id=entity_id
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching profile page for user {user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.post("/{user_id}/follow", status_code=status.HTTP_201_CREATED)
def follow_user_endpoint(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
    user_to_follow: User = Depends(validate_user)
) -> None:
    try:
        # prevent self-follow
        if current_user == user_to_follow.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot follow yourself")
        
        # check to make sure follow does not already exist
        follow: Optional[Follow] = follow_db.find_follow(db, follower_id=current_user, followed_id=user_to_follow.id)
        if follow:
            return
        
        # create follow
        follow = follow_db.create_follow(db, follower_id=current_user, followed_id=user_to_follow.id)
        return
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error following user {user_to_follow.id} by user {current_user}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
    
@router.delete("/{user_id}/follow", status_code=status.HTTP_204_NO_CONTENT)
def unfollow_user_endpoint(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
    user_to_unfollow: User = Depends(validate_user)
) -> None:
    try:
        # check to make sure follow exists
        follow: Optional[Follow] = follow_db.find_follow(db, follower_id=current_user, followed_id=user_to_unfollow.id)
        if not follow:
            return
        
        # delete follow
        success: bool = follow_db.delete_follow(db, follow_id=follow.id)
        if not success:
            logging.error(f"Failed to unfollow user: {user_to_unfollow.id} by user {current_user}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to unfollow user")
        return
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error unfollowing user {user_to_unfollow.id} by user {current_user}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
    
@router.get("/{user_id}/followers", response_model=UserListResponse)
def get_followers_endpoint(
    db: Session = Depends(get_db),
    user: User = Depends(validate_user)
) -> UserListResponse:
    try:
        followers: list[User] = [follow.follower for follow in user.followers]
        user_list = [UserReadResponse(id=follower.id, username=follower.username, full_name=follower.full_name, email=follower.email) for follower in followers]
        return UserListResponse(users=user_list)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching followers for user {user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
    
@router.get("/{user_id}/following", response_model=UserListResponse)
def get_following_endpoint(
    db: Session = Depends(get_db),
    user: User = Depends(validate_user)
) -> UserListResponse:
    try:
        following: list[User] = [follow.followed for follow in user.following]
        user_list = [UserReadResponse(id=followed.id, username=followed.username, full_name=followed.full_name, email=followed.email) for followed in following]
        return UserListResponse(users=user_list)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching following for user {user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
    
@router.get("/{user_id}/following/{followed_user_id}", response_model=bool)
def is_following_endpoint(
    followed_user_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(validate_user),
) -> bool:
    try:
        followed_user: Optional[User] = user_db.read_user(db, user_id=followed_user_id)
        if not followed_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User to check follow status not found")

        follow: Optional[Follow] = follow_db.find_follow(db, follower_id=user.id, followed_id=followed_user_id)
        return follow is not None
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error checking if user {user.id} is following user {followed_user_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")