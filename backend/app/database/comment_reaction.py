from sqlalchemy.orm import Session
from app.database.models import User, CommentReaction
from typing import Optional
from app.errors import DatabaseError
import logging

def create_comment_reaction(db: Session, user_id: int, comment_id: int, is_like: bool) -> CommentReaction:
    try:
        reaction = CommentReaction(
            user_id=user_id,
            comment_id=comment_id,
            is_like=is_like
        )
        db.add(reaction)
        db.commit()
        db.refresh(reaction)
        return reaction
    except Exception as e:
        logging.error(f"Error creating comment reaction: {e}")
        raise DatabaseError("Failed to create comment reaction")
    
def read_comment_reaction(db: Session, reaction_id: int) -> Optional[CommentReaction]:
    try:
        return db.query(CommentReaction).filter(CommentReaction.id == reaction_id).first()
    except Exception as e:
        logging.error(f"Error reading comment reaction {reaction_id}: {e}")
        raise DatabaseError("Failed to read comment reaction")
    
def update_comment_reaction(db: Session, reaction_id: int, is_like: bool) -> Optional[CommentReaction]:
    try:
        reaction = db.query(CommentReaction).filter(CommentReaction.id == reaction_id).first()
        if not reaction:
            return None
        reaction.is_like = is_like
        db.commit()
        db.refresh(reaction)
        return reaction
    except Exception as e:
        logging.error(f"Error updating comment reaction {reaction_id}: {e}")
        raise DatabaseError("Failed to update comment reaction")
    
def delete_comment_reaction(db: Session, reaction_id: int) -> bool:
    try:
        reaction = db.query(CommentReaction).filter(CommentReaction.id == reaction_id).first()
        if reaction:
            db.delete(reaction)
            db.commit()
            return True
    except Exception as e:
        logging.error(f"Error deleting comment reaction {reaction_id}: {e}")
        raise DatabaseError("Failed to delete comment reaction")
    return False

def read_comment_reaction_by_user_and_comment(db: Session, user_id: int, comment_id: int) -> Optional[CommentReaction]:
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        reaction = next(
            (r for r in user.comment_reactions if r.comment_id == comment_id),
            None
        )
        return reaction
    except Exception as e:
        logging.error(f"Error reading comment reaction for user {user_id} and comment {comment_id}: {e}")
        raise DatabaseError("Failed to read comment reaction by user and comment")