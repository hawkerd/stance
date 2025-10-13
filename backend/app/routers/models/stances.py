from pydantic import BaseModel
from typing import Optional, List

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
    average_rating: Optional[float]

class StanceUpdateRequest(BaseModel):
    headline: Optional[str] = None
    content_json: Optional[str] = None

class StanceUpdateResponse(BaseModel):
    id: int
    user_id: int
    entity_id: int
    headline: str
    content_json: str
    average_rating: Optional[float]

class StanceDeleteResponse(BaseModel):
    success: bool

class StanceListResponse(BaseModel):
    stances: list[StanceReadResponse]


class ReadStanceRatingResponse(BaseModel):
    rating: Optional[int] = None

class StanceRateRequest(BaseModel):
    rating: Optional[int] = None

class StanceRateResponse(BaseModel):
    success: bool

class NumRatingsResponse(BaseModel):
    num_ratings: int


class StanceFeedTag(BaseModel):
    id: int
    name: str
    tag_type: int
class StanceFeedUser(BaseModel):
    id: int
    username: str
class StanceFeedEntity(BaseModel):
    id: int
    type: int
    title: str
    images_json: str
    tags: List[StanceFeedTag]
    description: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
class StanceFeedStance(BaseModel):
    id: int
    user: StanceFeedUser
    entity: StanceFeedEntity
    headline: str
    content_json: str
    average_rating: Optional[float]
    num_ratings: int
    my_rating: Optional[int]
    tags: List[StanceFeedTag]
    created_at: Optional[str] = None
class StanceFeedRequest(BaseModel):
    num_stances: int = 20
    entities: Optional[List[int]]
class StanceFeedResponse(BaseModel):
    stances: List[StanceFeedStance]