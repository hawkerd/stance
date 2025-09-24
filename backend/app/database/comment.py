from sqlalchemy.orm import Session
from app.database.models.comment import Comment
from typing import Optional, List
from app.errors import DatabaseError
import logging

def create_comment(db: Session, user_id: int, stance_id: int, content: str, parent_id: Optional[int] = None) -> Comment:
    try:
        comment = Comment(
            user_id=user_id,
            stance_id=stance_id,
            content=content,
            parent_id=parent_id
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)
        return comment
    except Exception as e:
        logging.error(f"Error creating comment: {e}")
        raise DatabaseError("Failed to create comment")

def read_comment(db: Session, comment_id: int) -> Optional[Comment]:
    try:
        return db.query(Comment).filter(Comment.id == comment_id).first()
    except Exception as e:
        logging.error(f"Error reading comment {comment_id}: {e}")
        raise DatabaseError("Failed to read comment")

def update_comment(db: Session, comment_id: int, **kwargs) -> Optional[Comment]:
    try:
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if not comment:
            return None
        for key, value in kwargs.items():
            if hasattr(comment, key):
                setattr(comment, key, value)
        db.commit()
        db.refresh(comment)
        return comment
    except Exception as e:
        logging.error(f"Error updating comment {comment_id}: {e}")
        raise DatabaseError("Failed to update comment")

def delete_comment(db: Session, comment_id: int) -> bool:
    try:
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if comment:
            db.delete(comment)
            db.commit()
            return True
    except Exception as e:
        logging.error(f"Error deleting comment {comment_id}: {e}")
        raise DatabaseError("Failed to delete comment")
    return False

def get_all_comments(db: Session) -> List[Comment]:
    try:
        return db.query(Comment).all()
    except Exception as e:
        logging.error(f"Error getting all comments: {e}")
        raise DatabaseError("Failed to get all comments")
