from sqlalchemy.orm import Session
from app.database.models import User
from app.errors import DatabaseError
import logging

def create_user(db: Session, username: str, full_name: str | None, email: str, password_hash: str, is_admin: bool) -> User:
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

def read_user(db: Session, user_id: int) -> User | None:
    try:
        return db.query(User).filter(User.id == user_id).first()
    except Exception as e:
        logging.error(f"Error reading user {user_id}: {e}")
        raise DatabaseError("Failed to read user")

def update_user(db: Session, user_id: int, username: str | None, full_name: str | None, email: str | None) -> User | None:
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        if username is not None:
            user.username = username
        if full_name is not None:
            user.full_name = full_name
        if email is not None:
            user.email = email
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        logging.error(f"Error updating user {user_id}: {e}")
        raise DatabaseError("Failed to update user")

def update_user_password(db: Session, user_id: int, new_password_hash: str) -> User | None:
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        user.password_hash = new_password_hash
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        logging.error(f"Error updating password for user {user_id}: {e}")
        raise DatabaseError("Failed to update user password")

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

def get_user_by_username(db: Session, username: str) -> User | None:
    try:
        return db.query(User).filter(User.username == username).first()
    except Exception as e:
        logging.error(f"Error getting user by username {username}: {e}")
        raise DatabaseError("Failed to get user by username")

def get_user_by_email(db: Session, email: str) -> User | None:
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
    
def is_username_taken(db: Session, username: str) -> bool:
    try:
        return db.query(User).filter(User.username == username).count() > 0
    except Exception as e:
        logging.error(f"Error checking if username {username} is taken: {e}")
        raise DatabaseError("Failed to check if username is taken")