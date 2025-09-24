from sqlalchemy.orm import Session
from app.database.models.event import Event
from typing import Optional, List
from app.errors import DatabaseError
import logging
from datetime import datetime

def create_event(db: Session, title: str, description: str, start_time: Optional[datetime] = None, end_time: Optional[datetime] = None) -> Event:
    try:
        event = Event(
            title=title,
            description=description,
            start_time=start_time,
            end_time=end_time
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event
    except Exception as e:
        logging.error(f"Error creating event: {e}")
        raise DatabaseError("Failed to create event")

def read_event(db: Session, event_id: int) -> Optional[Event]:
    try:
        return db.query(Event).filter(Event.id == event_id).first()
    except Exception as e:
        logging.error(f"Error reading event {event_id}: {e}")
        raise DatabaseError("Failed to read event")

def update_event(db: Session, event_id: int, **kwargs) -> Optional[Event]:
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return None
        for key, value in kwargs.items():
            if hasattr(event, key):
                setattr(event, key, value)
        db.commit()
        db.refresh(event)
        return event
    except Exception as e:
        logging.error(f"Error updating event {event_id}: {e}")
        raise DatabaseError("Failed to update event")

def delete_event(db: Session, event_id: int) -> bool:
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if event:
            db.delete(event)
            db.commit()
            return True
    except Exception as e:
        logging.error(f"Error deleting event {event_id}: {e}")
        raise DatabaseError("Failed to delete event")
    return False

def get_all_events(db: Session) -> List[Event]:
    try:
        return db.query(Event).all()
    except Exception as e:
        logging.error(f"Error getting all events: {e}")
        raise DatabaseError("Failed to get all events")
