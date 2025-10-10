from sqlalchemy.orm import Session
from app.database.models import User, RefreshToken
from typing import Optional, List
from app.errors import DatabaseError
import logging

def create_refresh_token(db: Session, user_id: int, hashed_token: str, expires_at, revoked: bool = False) -> RefreshToken:
    try:
        token = RefreshToken(
            user_id=user_id,
            hashed_token=hashed_token,
            expires_at=expires_at,
            revoked=revoked
        )
        db.add(token)
        db.commit()
        db.refresh(token)
        return token
    except Exception as e:
        logging.error(f"Error creating refresh token for user {user_id}: {e}")
        raise DatabaseError("Failed to create refresh token")

def get_refresh_token(db: Session, token_id: int) -> Optional[RefreshToken]:
    try:
        return db.query(RefreshToken).filter(RefreshToken.id == token_id).first()
    except Exception as e:
        logging.error(f"Error getting refresh token {token_id}: {e}")
        raise DatabaseError("Failed to get refresh token")

def get_refresh_token_by_hash(db: Session, hashed_token: str) -> Optional[RefreshToken]:
    try:
        return db.query(RefreshToken).filter(RefreshToken.hashed_token == hashed_token).first()
    except Exception as e:
        logging.error(f"Error getting refresh token by hash: {e}")
        raise DatabaseError("Failed to get refresh token by hash")

def get_user_refresh_tokens(db: Session, user_id: int) -> List[RefreshToken]:
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return []
        return user.refresh_tokens
    except Exception as e:
        logging.error(f"Error getting refresh tokens for user {user_id}: {e}")
        raise DatabaseError("Failed to get user refresh tokens")

def update_refresh_token(db: Session, token_id: int, **kwargs) -> Optional[RefreshToken]:
    try:
        token = db.query(RefreshToken).filter(RefreshToken.id == token_id).first()
        if not token:
            return None
        for key, value in kwargs.items():
            if hasattr(token, key):
                setattr(token, key, value)
        db.commit()
        db.refresh(token)
        return token
    except Exception as e:
        logging.error(f"Error updating refresh token {token_id}: {e}")
        raise DatabaseError("Failed to update refresh token")

def delete_refresh_token(db: Session, token_id: int) -> bool:
    try:
        token = db.query(RefreshToken).filter(RefreshToken.id == token_id).first()
        if token:
            db.delete(token)
            db.commit()
            return True
    except Exception as e:
        logging.error(f"Error deleting refresh token {token_id}: {e}")
        raise DatabaseError("Failed to delete refresh token")
    return False