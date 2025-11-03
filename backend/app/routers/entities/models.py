from pydantic import BaseModel
from typing import Optional, List

class TagRequest(BaseModel):
    name: str
    tag_type: int

class TagResponse(BaseModel):
    id: int
    name: str
    tag_type: int

class EntityCreateRequest(BaseModel):
    type: int
    title: str
    images: List[str]  # array of b64 images
    tags: List[TagRequest]
    description: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class EntityReadResponse(BaseModel):
    id: int
    type: int
    title: str
    images_json: str
    tags: List[TagResponse]
    description: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    
class EntityUpdateRequest(BaseModel):
    title: Optional[str] = None
    images: Optional[List[str]] = None
    tags: Optional[List[TagRequest]] = None
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

class EntityFeedStance(BaseModel):
    id: int
    headline: str
    average_rating: Optional[float]
class EntityFeedTag(BaseModel):
    id: int
    name: str
    tag_type: int
class EntityFeedEntity(BaseModel):
    id: int
    type: int
    title: str
    images_json: str
    tags: List[EntityFeedTag]
    stances: List[EntityFeedStance]
    description: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
class EntityFeedResponse(BaseModel):
    entities: List[EntityFeedEntity]
    next_cursor: Optional[str]
    has_more: bool