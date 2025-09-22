from sqlalchemy.orm import Session
from app.database.models import User, RefreshToken
from typing import Optional, List
from app.errors import DatabaseError
import logging

# database layer logic - CRUD operations

def create_user(db: Session, username: str, full_name: Optional[str], bio: Optional[str], email: str, password_hash: str) -> User:
    try:
        user = User(
            username=username,
            full_name=full_name,
            bio=bio,
            email=email,
            password_hash=password_hash
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        logging.error(f"Error creating user: {e}")
        raise DatabaseError("Failed to create user")

def read_user(db: Session, user_id: int) -> User:
    try:
        return db.query(User).filter(User.id == user_id).first()
    except Exception as e:
        logging.error(f"Error reading user {user_id}: {e}")
        raise DatabaseError("Failed to read user")

def update_user(db: Session, user_id: int, **kwargs) -> Optional[User]:
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        logging.error(f"Error updating user {user_id}: {e}")
        raise DatabaseError("Failed to update user")

def delete_user(db: Session, user_id: int) -> bool:
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            db.delete(user)
            db.commit()
            return True
    except Exception as e:
        logging.error(f"Error deleting user {user_id}: {e}")
        raise DatabaseError("Failed to delete user")
    return False

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    try:
        return db.query(User).filter(User.username == username).first()
    except Exception as e:
        logging.error(f"Error getting user by username {username}: {e}")
        raise DatabaseError("Failed to get user by username")

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
        return db.query(RefreshToken).filter(RefreshToken.user_id == user_id).all()
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