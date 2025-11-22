from sqlalchemy.orm import Session
from app.database.models import *
from app.errors import DatabaseError
import logging
from datetime import datetime


def create_follow(db: Session, follower_id: int, followed_id: int) -> Follow:
    try:
        follow = Follow(follower_id=follower_id, followed_id=followed_id)
        db.add(follow)
        db.commit()
        db.refresh(follow)
        return follow
    except Exception as e:
        logging.error(f"Error creating follow from {follower_id} to {followed_id}: {e}")
        raise DatabaseError("Failed to create follow")


def find_follow(db: Session, follower_id: int, followed_id: int) -> Follow | None:
    try:
        return (
            db.query(Follow)
            .filter(
                Follow.follower_id == follower_id, Follow.followed_id == followed_id
            )
            .first()
        )
    except Exception as e:
        logging.error(f"Error finding follow from {follower_id} to {followed_id}: {e}")
        raise DatabaseError("Failed to find follow")


def read_follow(db: Session, follow_id: int) -> Follow | None:
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


def read_user_followers(
    db: Session, user_id: int, cursor: datetime | None = None, limit: int | None = None
) -> list[Follow]:
    try:
        query = (
            db.query(Follow)
            .filter(Follow.followed_id == user_id)
            .order_by(Follow.created_at.desc())
        )
        if cursor:
            query = query.filter(Follow.created_at < cursor)
        if limit:
            query = query.limit(limit + 1)  # one extra to check for more
        return query.all()
    except Exception as e:
        logging.error(f"Error reading followers for user {user_id}: {e}")
        raise DatabaseError("Failed to read user followers")


def read_user_following(
    db: Session, user_id: int, cursor: datetime | None = None, limit: int | None = None
) -> list[Follow]:
    try:
        query = (
            db.query(Follow)
            .filter(Follow.follower_id == user_id)
            .order_by(Follow.created_at.desc())
        )
        if cursor:
            query = query.filter(Follow.created_at < cursor)
        if limit:
            query = query.limit(limit + 1)  # one extra to check for more
        return query.all()
    except Exception as e:
        logging.error(f"Error reading following for user {user_id}: {e}")
        raise DatabaseError("Failed to read user following")
