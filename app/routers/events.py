from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_is_admin
from app.database.event import create_event, read_event, update_event, delete_event, get_all_events
from app.routers.models.events import EventCreateRequest, EventReadResponse, EventUpdateRequest, EventUpdateResponse, EventDeleteResponse
import logging
from datetime import datetime

router = APIRouter()

@router.post("/events", response_model=EventReadResponse)
def create_event_endpoint(request: EventCreateRequest, db: Session = Depends(get_db), is_admin: bool = Depends(get_is_admin)) -> EventReadResponse:
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    event = create_event(
        db,
        title=request.title,
        description=request.description,
        start_time=request.start_time,
        end_time=request.end_time
    )
    if not event:
        raise HTTPException(status_code=400, detail="Failed to create event")
    return EventReadResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        start_time=event.start_time.isoformat() if event.start_time else None,
        end_time=event.end_time.isoformat() if event.end_time else None,
    )

@router.get("/events/{event_id}", response_model=EventReadResponse)
def get_event_endpoint(event_id: int, db: Session = Depends(get_db)) -> EventReadResponse:
    event = read_event(db, event_id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return EventReadResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        start_time=event.start_time.isoformat() if event.start_time else None,
        end_time=event.end_time.isoformat() if event.end_time else None,
    )

@router.put("/events/{event_id}", response_model=EventUpdateResponse)
def update_event_endpoint(event_id: int, request: EventUpdateRequest, db: Session = Depends(get_db), is_admin: bool = Depends(get_is_admin)) -> EventUpdateResponse:
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    event = update_event(db, event_id=event_id, **request.model_dump(exclude_unset=True))
    if not event:
        raise HTTPException(status_code=400, detail="Failed to update event")
    return EventUpdateResponse(
        id=event.id,
        title=event.title,
        description=event.description,
    )

@router.delete("/events/{event_id}")
def delete_event_endpoint(event_id: int, db: Session = Depends(get_db), is_admin: bool = Depends(get_is_admin)):
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    success = delete_event(db, event_id=event_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete event")
    return EventDeleteResponse(success=True)

@router.get("/events", response_model=list[EventReadResponse])
def get_all_events_endpoint(db: Session = Depends(get_db)):
    events = get_all_events(db)
    return [
        EventReadResponse(
            id=event.id,
            title=event.title,
            description=event.description,
            start_time=event.start_time.isoformat() if event.start_time else None,
            end_time=event.end_time.isoformat() if event.end_time else None,
        ) for event in events
    ]
