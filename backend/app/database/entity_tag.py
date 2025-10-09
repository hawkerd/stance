from sqlalchemy.orm import Session
from app.database.models.entity_tag import EntityTag
from app.errors import DatabaseError
import logging
from typing import Optional, List

def create_entity_tag(db: Session, entity_id: int, tag_id: int) -> EntityTag:
    try:
        entity_tag = EntityTag(entity_id=entity_id, tag_id=tag_id)
        db.add(entity_tag)
        db.commit()
        db.refresh(entity_tag)
        return entity_tag
    except Exception as e:
        db.rollback()
        logging.error(f"Error creating entity_tag: {e}")
        raise DatabaseError("Failed to create entity_tag")

def get_entity_tag(db: Session, entity_tag_id: int) -> Optional[EntityTag]:
    try:
        return db.query(EntityTag).filter(EntityTag.id == entity_tag_id).first()
    except Exception as e:
        logging.error(f"Error reading entity_tag {entity_tag_id}: {e}")
        raise DatabaseError("Failed to read entity_tag")

def get_entity_tags(db: Session) -> List[EntityTag]:
    try:
        return db.query(EntityTag).all()
    except Exception as e:
        logging.error(f"Error getting entity_tags: {e}")
        raise DatabaseError("Failed to get entity_tags")

def update_entity_tag(db: Session, entity_tag_id: int, **kwargs) -> Optional[EntityTag]:
    try:
        entity_tag = db.query(EntityTag).filter(EntityTag.id == entity_tag_id).first()
        if not entity_tag:
            return None
        for key, value in kwargs.items():
            if hasattr(entity_tag, key):
                setattr(entity_tag, key, value)
        db.commit()
        db.refresh(entity_tag)
        return entity_tag
    except Exception as e:
        db.rollback()
        logging.error(f"Error updating entity_tag {entity_tag_id}: {e}")
        raise DatabaseError("Failed to update entity_tag")

def delete_entity_tag(db: Session, entity_tag_id: int) -> bool:
    try:
        entity_tag = db.query(EntityTag).filter(EntityTag.id == entity_tag_id).first()
        if entity_tag:
            db.delete(entity_tag)
            db.commit()
            return True
    except Exception as e:
        db.rollback()
        logging.error(f"Error deleting entity_tag {entity_tag_id}: {e}")
        raise DatabaseError("Failed to delete entity_tag")
    return False

def find_entity_tag(db: Session, entity_id: int, tag_id: int) -> Optional[EntityTag]:
    return db.query(EntityTag).filter(EntityTag.entity_id == entity_id, EntityTag.tag_id == tag_id).first()

def get_tags_for_entity(db: Session, entity_id: int) -> List[EntityTag]:
    try:
        return db.query(EntityTag).filter(EntityTag.entity_id == entity_id).all()
    except Exception as e:
        logging.error(f"Error getting tags for entity {entity_id}: {e}")
        raise DatabaseError("Failed to get tags for entity")

def get_entities_for_tag(db: Session, tag_id: int) -> List[EntityTag]:
    try:
        return db.query(EntityTag).filter(EntityTag.tag_id == tag_id).all()
    except Exception as e:
        logging.error(f"Error getting entities for tag {tag_id}: {e}")
        raise DatabaseError("Failed to get entities for tag")

def delete_entity_tags_for_entity(db: Session, entity_id: int) -> None:
    db.query(EntityTag).filter(EntityTag.entity_id == entity_id).delete()
    db.commit()