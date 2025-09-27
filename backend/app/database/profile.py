from sqlalchemy.orm import Session
from app.database.models.profile import Profile
from app.database.models.user import User
from typing import Optional, List
from app.errors import DatabaseError
import logging

def create_profile(db: Session, user_id: int, bio: Optional[str] = None, avatar_url: Optional[str] = None, pinned_stance_id: Optional[int] = None) -> Profile:
    try:
        profile = Profile(
            user_id=user_id,
            bio=bio,
            avatar_url=avatar_url,
            pinned_stance_id=pinned_stance_id
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile
    except Exception as e:
        logging.error(f"Error creating profile: {e}")
        raise DatabaseError("Failed to create profile")

def read_profile(db: Session, profile_id: int) -> Optional[Profile]:
    try:
        return db.query(Profile).filter(Profile.id == profile_id).first()
    except Exception as e:
        logging.error(f"Error reading profile {profile_id}: {e}")
        raise DatabaseError("Failed to read profile")

def update_profile(db: Session, profile_id: int, **kwargs) -> Optional[Profile]:
    try:
        profile = db.query(Profile).filter(Profile.id == profile_id).first()
        if not profile:
            return None
        for key, value in kwargs.items():
            if hasattr(profile, key):
                setattr(profile, key, value)
        db.commit()
        db.refresh(profile)
        return profile
    except Exception as e:
        logging.error(f"Error updating profile {profile_id}: {e}")
        raise DatabaseError("Failed to update profile")

def delete_profile(db: Session, profile_id: int) -> bool:
    try:
        profile = db.query(Profile).filter(Profile.id == profile_id).first()
        if profile:
            db.delete(profile)
            db.commit()
            return True
    except Exception as e:
        logging.error(f"Error deleting profile {profile_id}: {e}")
        raise DatabaseError("Failed to delete profile")
    return False

def get_all_profiles(db: Session) -> List[Profile]:
    try:
        return db.query(Profile).all()
    except Exception as e:
        logging.error(f"Error getting all profiles: {e}")
        raise DatabaseError("Failed to get all profiles")

def get_profile_by_user_id(db: Session, user_id: int) -> Optional[Profile]:
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        return user.profile
    except Exception as e:
        logging.error(f"Error getting profile by user_id {user_id}: {e}")
        raise DatabaseError("Failed to get profile by user_id")