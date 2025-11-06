from pydantic import BaseModel

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
    images: list[str]  # array of b64 images
    tags: list[TagRequest]
    description: str | None = None
    start_time: str | None = None
    end_time: str | None = None

class EntityReadResponse(BaseModel):
    id: int
    type: int
    title: str
    images_json: str
    tags: list[TagResponse]
    description: str | None = None
    start_time: str | None = None
    end_time: str | None = None
    
class EntityUpdateRequest(BaseModel):
    title: str | None = None
    images: list[str] | None = None
    tags: list[TagRequest] | None = None
    description: str | None = None
    start_time: str | None = None
    end_time: str | None = None

class EntityUpdateResponse(BaseModel):
    id: int
    type: int
    title: str
    images_json: str
    description: str | None = None
    start_time: str | None = None
    end_time: str | None = None

class EntityDeleteResponse(BaseModel):
    success: bool

class EntityListResponse(BaseModel):
    entities: list[EntityReadResponse]

class EntityFeedStance(BaseModel):
    id: int
    headline: str
    average_rating: float | None
class EntityFeedTag(BaseModel):
    id: int
    name: str
    tag_type: int
class EntityFeedEntity(BaseModel):
    id: int
    type: int
    title: str
    images_json: str
    tags: list[EntityFeedTag]
    stances: list[EntityFeedStance]
    description: str | None = None
    start_time: str | None = None
    end_time: str | None = None
class EntityFeedResponse(BaseModel):
    entities: list[EntityFeedEntity]
    next_cursor: str | None
    has_more: bool