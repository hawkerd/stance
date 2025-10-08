from pydantic import BaseModel
from typing import Optional

class StanceCreateRequest(BaseModel):
    event_id: Optional[int] = None
    issue_id: Optional[int] = None
    headline: str
    content_json: str

class StanceCreateResponse(BaseModel):
    id: int
    user_id: int
    event_id: Optional[int] = None
    issue_id: Optional[int] = None
    headline: str
    content_json: str

class StanceReadResponse(BaseModel):
    id: int
    user_id: int
    event_id: Optional[int] = None
    issue_id: Optional[int] = None
    headline: str
    content_json: str

class StanceUpdateRequest(BaseModel):
    headline: Optional[str] = None
    content_json: Optional[str] = None

class StanceUpdateResponse(BaseModel):
    id: int
    user_id: int
    event_id: Optional[int] = None
    issue_id: Optional[int] = None
    headline: str
    content_json: str

class StanceDeleteResponse(BaseModel):
    success: bool

class StanceListResponse(BaseModel):
    stances: list[StanceReadResponse]