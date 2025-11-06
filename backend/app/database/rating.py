from sqlalchemy.orm import Session
from app.database.models.rating import Rating
import logging
from app.errors import DatabaseError

def create_or_update_rating(db: Session, stance_id: int, user_id: int, rating_value: int) -> Rating:
    try:
        existing = db.query(Rating).filter_by(stance_id=stance_id, user_id=user_id).first()
        if existing:
            existing.rating = rating_value
            db.commit()
            db.refresh(existing)
            return existing
        new_rating = Rating(stance_id=stance_id, user_id=user_id, rating=rating_value)
        db.add(new_rating)
        db.commit()
        db.refresh(new_rating)
        return new_rating
    except Exception as e:
        logging.error(f"Error creating/updating rating: {e}")
        raise DatabaseError("Failed to create or update rating")

def read_rating_by_user_and_stance(db: Session, stance_id: int, user_id: int) -> Rating | None:
    try:
        return db.query(Rating).filter_by(stance_id=stance_id, user_id=user_id).first()
    except Exception as e:
        logging.error(f"Error reading rating for stance {stance_id} and user {user_id}: {e}")
        raise DatabaseError("Failed to read rating")

def read_ratings_for_stance(db: Session, stance_id: int) -> list[Rating]:
    try:
        return db.query(Rating).filter_by(stance_id=stance_id).all()
    except Exception as e:
        logging.error(f"Error reading ratings for stance {stance_id}: {e}")
        raise DatabaseError("Failed to read ratings for stance")

def delete_rating_by_id(db: Session, rating_id: int) -> bool:
    try:
        rating = db.query(Rating).filter_by(id=rating_id).first()
        if not rating:
            return False
        db.delete(rating)
        db.commit()
        return True
    except Exception as e:
        logging.error(f"Error deleting rating {rating_id}: {e}")
        raise DatabaseError("Failed to delete rating")

def get_average_rating_for_stance(db: Session, stance_id: int) -> float:
    try:
        from sqlalchemy import func
        avg = db.query(func.avg(Rating.rating)).filter_by(stance_id=stance_id).scalar()
        if avg is None:
            return None
        return float(avg)
    except Exception as e:
        logging.error(f"Error getting average rating for stance {stance_id}: {e}")
        raise DatabaseError("Failed to get average rating for stance")

def rate_stance(db: Session, user_id: int, stance_id: int, rating: int | None) -> bool:
    try:
        if rating is None:
            existing = read_rating_by_user_and_stance(db, stance_id, user_id)
            if not existing:
                return True
            return delete_rating_by_id(db, existing.id)
        else:
            create_or_update_rating(db, stance_id, user_id, rating)
            return True
    except Exception as e:
        logging.error(f"Error in rate_stance: {e}")
        return False
    
def get_num_ratings_for_stance(db: Session, stance_id: int) -> int:
    try:
        from sqlalchemy import func
        count = db.query(func.count()).select_from(Rating).filter_by(stance_id=stance_id).scalar()
        return int(count) if count is not None else 0
    except Exception as e:
        logging.error(f"Error getting num ratings for stance {stance_id}: {e}")
        raise DatabaseError("Failed to get num ratings for stance")