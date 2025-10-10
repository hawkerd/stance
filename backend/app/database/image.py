from sqlalchemy.orm import Session
from app.database.models import Image
from typing import Optional, List
from app.errors import DatabaseError
import logging

def create_image(db: Session, stance_id: Optional[int], entity_id: Optional[int], 
                public_url: str, file_size: int, file_type: str) -> Image:
    try:
        image = Image(
            stance_id=stance_id,
            entity_id=entity_id,
            public_url=public_url,
            file_size=file_size,
            file_type=file_type
        )
        db.add(image)
        db.commit()
        db.refresh(image)
        return image
    except Exception as e:
        db.rollback()
        logging.error(f"Error creating image: {e}")
        raise DatabaseError("Failed to create image")

def read_image(db: Session, image_id: int) -> Optional[Image]:
    try:
        return db.query(Image).filter(Image.id == image_id).first()
    except Exception as e:
        logging.error(f"Error reading image {image_id}: {e}")
        raise DatabaseError("Failed to read image")

def update_image(db: Session, image_id: int, **kwargs) -> Optional[Image]:
    try:
        image = db.query(Image).filter(Image.id == image_id).first()
        if not image:
            return None
        for key, value in kwargs.items():
            if hasattr(image, key):
                setattr(image, key, value)
        db.commit()
        db.refresh(image)
        return image
    except Exception as e:
        logging.error(f"Error updating image {image_id}: {e}")
        raise DatabaseError("Failed to update image")

def delete_image(db: Session, image_id: int) -> bool:
    try:
        image = db.query(Image).filter(Image.id == image_id).first()
        if image:
            db.delete(image)
            db.commit()
            return True
    except Exception as e:
        logging.error(f"Error deleting image {image_id}: {e}")
        raise DatabaseError("Failed to delete image")
    return False

def get_images_by_stance(db: Session, stance_id: int) -> List[Image]:
    try:
        return db.query(Image).filter(Image.stance_id == stance_id).all()
    except Exception as e:
        logging.error(f"Error getting images for stance {stance_id}: {e}")
        raise DatabaseError("Failed to get images by stance")

def get_images_by_entity(db: Session, entity_id: int) -> List[Image]:
    try:
        return db.query(Image).filter(Image.entity_id == entity_id).all()
    except Exception as e:
        logging.error(f"Error getting images for entity {entity_id}: {e}")
        raise DatabaseError("Failed to get images by entity")