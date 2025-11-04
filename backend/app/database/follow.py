from sqlalchemy.orm import Session
from app.database.models.follow import Follow
from typing import Optional
from app.errors import DatabaseError
import logging

def create_follow(db: Session, follower_id: int, followed_id: int) -> Follow:
    try:
        follow = Follow(
            follower_id=follower_id,
            followed_id=followed_id
        )
        db.add(follow)
        db.commit()
        db.refresh(follow)
        return follow
    except Exception as e:
        logging.error(f"Error creating follow from {follower_id} to {followed_id}: {e}")
        raise DatabaseError("Failed to create follow")

def find_follow(db: Session, follower_id: int, followed_id: int) -> Optional[Follow]:
    try:
        return db.query(Follow).filter(
            Follow.follower_id == follower_id,
            Follow.followed_id == followed_id
        ).first()
    except Exception as e:
        logging.error(f"Error finding follow from {follower_id} to {followed_id}: {e}")
        raise DatabaseError("Failed to find follow")

def read_follow(db: Session, follow_id: int) -> Optional[Follow]:
    try:
        return db.query(Follow).filter(Follow.id == follow_id).first()
    except Exception as e:
        logging.error(f"Error reading follow {follow_id}: {e}")
        raise DatabaseError("Failed to read follow")
    
def delete_follow(db: Session, follow_id: int) -> bool:
    try:
        follow = db.query(Follow).filter(Follow.id == follow_id).first()
        if follow:
            db.delete(follow)
            db.commit()
            return True
    except Exception as e:
        logging.error(f"Error deleting follow {follow_id}: {e}")
        raise DatabaseError("Failed to delete follow")
    return False
