from sqlalchemy.orm import Session
from app.database.models.demographic import Demographic
from app.database.models.user import User
from typing import Optional, List
from app.errors import DatabaseError
import logging

def create_demographic(db: Session, user_id: int, birth_year: Optional[int] = None, gender: Optional[str] = None, zip_code: Optional[str] = None) -> Demographic:
    try:
        demographic = Demographic(
            user_id=user_id,
            birth_year=birth_year,
            gender=gender,
            zip_code=zip_code
        )
        db.add(demographic)
        db.commit()
        db.refresh(demographic)
        return demographic
    except Exception as e:
        logging.error(f"Error creating demographic: {e}")
        raise DatabaseError("Failed to create demographic")

def read_demographic(db: Session, demographic_id: int) -> Optional[Demographic]:
    try:
        return db.query(Demographic).filter(Demographic.id == demographic_id).first()
    except Exception as e:
        logging.error(f"Error reading demographic {demographic_id}: {e}")
        raise DatabaseError("Failed to read demographic")

def update_demographic(db: Session, demographic_id: int, **kwargs) -> Optional[Demographic]:
    try:
        demographic = db.query(Demographic).filter(Demographic.id == demographic_id).first()
        if not demographic:
            return None
        for key, value in kwargs.items():
            if hasattr(demographic, key):
                setattr(demographic, key, value)
        db.commit()
        db.refresh(demographic)
        return demographic
    except Exception as e:
        logging.error(f"Error updating demographic {demographic_id}: {e}")
        raise DatabaseError("Failed to update demographic")

def delete_demographic(db: Session, demographic_id: int) -> bool:
    try:
        demographic = db.query(Demographic).filter(Demographic.id == demographic_id).first()
        if demographic:
            db.delete(demographic)
            db.commit()
            return True
    except Exception as e:
        logging.error(f"Error deleting demographic {demographic_id}: {e}")
        raise DatabaseError("Failed to delete demographic")
    return False

def get_all_demographics(db: Session) -> List[Demographic]:
    try:
        return db.query(Demographic).all()
    except Exception as e:
        logging.error(f"Error getting all demographics: {e}")
        raise DatabaseError("Failed to get all demographics")
    
def get_demographic_by_user_id(db: Session, user_id: int) -> Optional[Demographic]:
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        return user.demographic
    except Exception as e:
        logging.error(f"Error getting demographic for user {user_id}: {e}")
        raise DatabaseError("Failed to get demographic by user ID")
