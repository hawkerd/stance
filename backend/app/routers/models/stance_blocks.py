from pydantic import BaseModel
from typing import Optional, List

class StanceBlockCreateRequest(BaseModel):
    content: Optional[str] = None
    media_url: Optional[str] = None
    sort_order: int

class StanceBlockUpdateRequest(BaseModel):
    content: Optional[str] = None
    media_url: Optional[str] = None
    sort_order: Optional[int] = None

class StanceBlockReadResponse(BaseModel):
    id: int
    content: Optional[str] = None
    media_url: Optional[str] = None
    sort_order: int

class StanceBlockListResponse(BaseModel):
    blocks: List[StanceBlockReadResponse]

class DeleteStanceBlockResponse(BaseModel):
    success: bool
