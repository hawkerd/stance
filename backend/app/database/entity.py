from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.database.models import Entity
from typing import Optional, List
from app.errors import DatabaseError
import logging
from datetime import datetime

def create_entity(db: Session, type: int, title: str, images_json: str, description: str = None, start_time: Optional[datetime] = None, end_time: Optional[datetime] = None) -> Entity:
    try:
        entity = Entity(
            type=type,
            title=title,
            images_json=images_json,
            description=description,
            start_time=start_time,
            end_time=end_time
        )
        db.add(entity)
        db.commit()
        db.refresh(entity)
        return entity
    except Exception as e:
        logging.error(f"Error creating entity: {e}")
        raise DatabaseError("Failed to create entity")

def read_entity(db: Session, entity_id: int) -> Optional[Entity]:
    try:
        return db.query(Entity).filter(Entity.id == entity_id).first()
    except Exception as e:
        logging.error(f"Error reading entity {entity_id}: {e}")
        raise DatabaseError("Failed to read entity")

def update_entity(db: Session, entity_id: int, **kwargs) -> Optional[Entity]:
    ALLOWED_FIELDS = {"title", "description", "start_time", "end_time", "images_json"}
    try:
        entity = db.query(Entity).filter(Entity.id == entity_id).first()
        if not entity:
            return None
        for key, value in kwargs.items():
            if hasattr(entity, key) and key in ALLOWED_FIELDS:
                setattr(entity, key, value)
        db.commit()
        db.refresh(entity)
        return entity
    except Exception as e:
        logging.error(f"Error updating entity {entity_id}: {e}")
        raise DatabaseError("Failed to update entity")

def delete_entity(db: Session, entity_id: int) -> bool:
    try:
        entity = db.query(Entity).filter(Entity.id == entity_id).first()
        if entity:
            db.delete(entity)
            db.commit()
            return True
    except Exception as e:
        logging.error(f"Error deleting entity {entity_id}: {e}")
        raise DatabaseError("Failed to delete entity")
    return False

def get_all_entities(db: Session) -> List[Entity]:
    try:
        return db.query(Entity).all()
    except Exception as e:
        logging.error(f"Error getting all entities: {e}")
        raise DatabaseError("Failed to get all entities")

def get_random_entities(db: Session, n: int) -> List[Entity]:
    """Fetch n random entities from the database."""
    try:
        entities = db.query(Entity).order_by(func.random()).limit(n).all()
        return entities
    except Exception as e:
        logging.error(f"Error getting {n} random entities: {e}")
        raise DatabaseError("Failed to get random entities")

def get_entities_paginated(db: Session, limit: int, cursor: Optional[datetime] = None) -> List[Entity]:
    """Fetch entities ordered by created_at (descending) with cursor-based pagination."""
    try:
        query = db.query(Entity)
        if cursor:
            query = query.filter(Entity.created_at < cursor)
        
        entities = query.order_by(Entity.created_at.desc(), Entity.id.desc()).limit(limit).all()
        return entities
    except Exception as e:
        logging.error(f"Error getting paginated entities (cursor={cursor}, limit={limit}): {e}")
        raise DatabaseError("Failed to get paginated entities")
    