from pydantic import BaseModel
from typing import Optional

class StanceCreateRequest(BaseModel):
    entity_id: int
    headline: str
    content_json: str

class StanceCreateResponse(BaseModel):
    id: int
    user_id: int
    entity_id: int
    headline: str
    content_json: str

class StanceReadResponse(BaseModel):
    id: int
    user_id: int
    entity_id: int
    headline: str
    content_json: str

class StanceUpdateRequest(BaseModel):
    headline: Optional[str] = None
    content_json: Optional[str] = None

class StanceUpdateResponse(BaseModel):
    id: int
    user_id: int
    entity_id: int
    headline: str
    content_json: str

class StanceDeleteResponse(BaseModel):
    success: bool

class StanceListResponse(BaseModel):
    stances: list[StanceReadResponse]