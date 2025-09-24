from pydantic import BaseModel
from typing import Optional

class StanceCreateRequest(BaseModel):
    event_id: Optional[int] = None
    issue_id: Optional[int] = None
    stance: str

class StanceCreateResponse(BaseModel):
    id: int
    user_id: int
    event_id: Optional[int] = None
    issue_id: Optional[int] = None
    stance: str

class StanceReadResponse(BaseModel):
    id: int
    user_id: int
    event_id: Optional[int] = None
    issue_id: Optional[int] = None
    stance: str

class StanceUpdateRequest(BaseModel):
    stance_id: int
    stance: str

class StanceUpdateResponse(BaseModel):
    id: int
    user_id: int
    event_id: Optional[int] = None
    issue_id: Optional[int] = None
    stance: str

class StanceDeleteResponse(BaseModel):
    success: bool