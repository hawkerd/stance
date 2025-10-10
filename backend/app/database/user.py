from sqlalchemy.orm import Session
from app.database.models import User
from typing import Optional
from app.errors import DatabaseError
import logging

def create_user(db: Session, username: str, full_name: Optional[str], email: str, password_hash: str, is_admin: bool) -> User:
    try:
        user = User(
            username=username,
            full_name=full_name,
            email=email,
            password_hash=password_hash,
            is_admin=is_admin
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

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    try:
        return db.query(User).filter(User.email == email).first()
    except Exception as e:
        logging.error(f"Error getting user by email {email}: {e}")
        raise DatabaseError("Failed to get user by email")
    
def is_user_admin(db: Session, user_id: int) -> bool:
    try:
        user = db.query(User).filter(User.id == user_id).first()
        return user.is_admin if user else False
    except Exception as e:
        logging.error(f"Error checking if user {user_id} is admin: {e}")
        raise DatabaseError("Failed to check if user is admin")