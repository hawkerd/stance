from sqlalchemy.orm import Session
from app.database.models.stance import Stance
from app.database.models.user import User
from app.database.models.event import Event
from app.database.models.issue import Issue
from app.database.models.comment import Comment
from typing import Optional, List
from app.errors import DatabaseError
import logging

def create_stance(db: Session, user_id: int, event_id: Optional[int], issue_id: Optional[int], headline: str, content_json: str) -> Stance:
    try:
        stance_obj = Stance(
            user_id=user_id,
            event_id=event_id,
            issue_id=issue_id,
            headline=headline,
            content_json=content_json
        )
        db.add(stance_obj)
        db.commit()
        db.refresh(stance_obj)
        return stance_obj
    except Exception as e:
        logging.error(f"Error creating stance: {e}")
        raise DatabaseError("Failed to create stance")

def read_stance(db: Session, stance_id: int) -> Optional[Stance]:
    try:
        return db.query(Stance).filter(Stance.id == stance_id).first()
    except Exception as e:
        logging.error(f"Error reading stance {stance_id}: {e}")
        raise DatabaseError("Failed to read stance")

def update_stance(db: Session, stance_id: int, **kwargs) -> Optional[Stance]:
    try:
        stance_obj = db.query(Stance).filter(Stance.id == stance_id).first()
        if not stance_obj:
            return None
        for key, value in kwargs.items():
            if key in ["headline", "content_json", "event_id", "issue_id"] and hasattr(stance_obj, key):
                setattr(stance_obj, key, value)
        db.commit()
        db.refresh(stance_obj)
        return stance_obj
    except Exception as e:
        logging.error(f"Error updating stance {stance_id}: {e}")
        raise DatabaseError("Failed to update stance")

def delete_stance(db: Session, stance_id: int) -> bool:
    try:
        stance_obj = db.query(Stance).filter(Stance.id == stance_id).first()
        if stance_obj:
            db.delete(stance_obj)
            db.commit()
            return True
    except Exception as e:
        logging.error(f"Error deleting stance {stance_id}: {e}")
        raise DatabaseError("Failed to delete stance")
    return False

def get_all_stances(db: Session) -> List[Stance]:
    try:
        return db.query(Stance).all()
    except Exception as e:
        logging.error(f"Error getting all stances: {e}")
        raise DatabaseError("Failed to get all stances")

def get_stances_by_user(db: Session, user_id: int) -> List[Stance]:
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return []
        return user.stances
    except Exception as e:
        logging.error(f"Error getting stances for user {user_id}: {e}")
        raise DatabaseError("Failed to get stances by user")
    
def get_stances_by_event(db: Session, event_id: int) -> List[Stance]:
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return []
        return event.stances
    except Exception as e:
        logging.error(f"Error getting stances for event {event_id}: {e}")
        raise DatabaseError("Failed to get stances by event")
    
def get_user_stance_by_event(db: Session, event_id: int, user_id: int) -> Optional[Stance]:
    """
    Returns the stance for a given user and event, or None if not found.
    """
    try:
        return db.query(Stance).filter(Stance.event_id == event_id, Stance.user_id == user_id).first()
    except Exception as e:
        logging.error(f"Error getting user {user_id} stance for event {event_id}: {e}")
        raise DatabaseError("Failed to get user stance by event")
def get_stances_by_issue(db: Session, issue_id: int) -> List[Stance]:
    try:
        issue = db.query(Issue).filter(Issue.id == issue_id).first()
        if not issue:
            return []
        return issue.stances
    except Exception as e:
        logging.error(f"Error getting stances for issue {issue_id}: {e}")
        raise DatabaseError("Failed to get stances by issue")
    
def get_user_stance_by_issue(db: Session, issue_id: int, user_id: int) -> Optional[Stance]:
    """
    Returns the stance for a given user and issue, or None if not found.
    """
    try:
        return db.query(Stance).filter(Stance.issue_id == issue_id, Stance.user_id == user_id).first()
    except Exception as e:
        logging.error(f"Error getting user {user_id} stance for issue {issue_id}: {e}")
        raise DatabaseError("Failed to get user stance by issue")
    
def get_comments_by_stance(db: Session, stance_id: int, nested: bool) -> List[Comment]:
    try:
        stance = db.query(Stance).filter(Stance.id == stance_id).first()
        if not stance:
            return []
        
        if nested:
            return stance.comments
        else:
            return [comment for comment in stance.comments if comment.parent_id is None]
    except Exception as e:
        logging.error(f"Error getting comments for stance {stance_id}: {e}")
        raise DatabaseError("Failed to get comments by stance")