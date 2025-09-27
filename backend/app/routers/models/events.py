from pydantic import BaseModel
from typing import Optional

class EventCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class EventReadResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class EventUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class EventUpdateResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class EventDeleteResponse(BaseModel):
    success: bool

class EventListResponse(BaseModel):
    events: list[EventReadResponse]