from pydantic import BaseModel
from typing import Optional, List

class EntityCreateRequest(BaseModel):
    type: int
    title: str
    images: List[str]  # array of b64 images
    description: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class EntityReadResponse(BaseModel):
    id: int
    type: int
    title: str
    images_json: str
    description: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
class EntityUpdateRequest(BaseModel):
    title: Optional[str] = None
    images: Optional[List[str]] = None
    description: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class EntityUpdateResponse(BaseModel):
    id: int
    type: int
    title: str
    images_json: str
    description: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class EntityDeleteResponse(BaseModel):
    success: bool

class EntityListResponse(BaseModel):
    entities: List[EntityReadResponse]
