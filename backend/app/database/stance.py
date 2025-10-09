from sqlalchemy.orm import Session
from app.database.models.stance import Stance
from app.database.models.user import User
from app.database.models.entity import Entity
from app.database.models.comment import Comment
from typing import Optional, List
from app.errors import DatabaseError
import logging

def create_stance(db: Session, user_id: int, entity_id: int, headline: str, content_json: str) -> Stance:
    try:
        stance_obj = Stance(
            user_id=user_id,
            entity_id=entity_id,
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
    ALLOWED_FIELDS = {"headline", "content_json", "entity_id"}
    try:
        stance_obj = db.query(Stance).filter(Stance.id == stance_id).first()
        if not stance_obj:
            return None
        for key, value in kwargs.items():
            if hasattr(stance_obj, key) and key in ALLOWED_FIELDS:
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
    
def get_stances_by_entity(db: Session, entity_id: int) -> List[Stance]:
    try:
        entity = db.query(Entity).filter(Entity.id == entity_id).first()
        if not entity:
            return []
        return entity.stances
    except Exception as e:
        logging.error(f"Error getting stances for entity {entity_id}: {e}")
        raise DatabaseError("Failed to get stances by entity")
    
def get_user_stance_by_entity(db: Session, entity_id: int, user_id: int) -> Optional[Stance]:
    try:
        entity = db.query(Entity).filter(Entity.id == entity_id).first()
        if not entity:
            return None
        return next((stance for stance in entity.stances if stance.user_id == user_id), None)
    except Exception as e:
        logging.error(f"Error getting user {user_id} stance for entity {entity_id}: {e}")
        raise DatabaseError("Failed to get user stance by entity")
    
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