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


class StanceFeedCursor(BaseModel):
    score: Optional[float]
    id: Optional[int]
class StanceFeedTag(BaseModel):
    id: int
    name: str
    tag_type: int
class StanceFeedUser(BaseModel):
    id: int
    username: str
    avatar_url: Optional[str]
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
    num_comments: int
    average_rating: Optional[float]
    num_ratings: int
    my_rating: Optional[int]
    tags: List[StanceFeedTag]
    created_at: str
class StanceFeedRequest(BaseModel):
    num_stances: int = 20
    initial_stance_id: Optional[int]
    entities: Optional[List[int]]
    cursor: Optional[StanceFeedCursor] = None
class StanceFeedResponse(BaseModel):
    stances: List[StanceFeedStance]
    next_cursor: Optional[StanceFeedCursor] = None
class StanceFeedStanceResponse(BaseModel):
    stance: StanceFeedStance


# paginated stances by entity do not include entity info, and use a str for cursor
class PaginatedStancesByEntityStance(BaseModel):
    id: int
    user: StanceFeedUser
    headline: str
    content_json: str
    num_comments: int
    average_rating: Optional[float]
    num_ratings: int
    my_rating: Optional[int]
    tags: List[StanceFeedTag]
    created_at: Optional[str] = None
class PaginatedStancesByEntityCursor(BaseModel):
    score: float
    id: int
class PaginatedStanceByEntityRequest(BaseModel):
    num_stances: int = 20
    cursor: Optional[PaginatedStancesByEntityCursor]
class PaginatedStancesByEntityResponse(BaseModel):
    stances: List[PaginatedStancesByEntityStance]
    next_cursor: Optional[PaginatedStancesByEntityCursor] = None
class PaginatedStancesByEntityStanceResponse(BaseModel):
    stance: PaginatedStancesByEntityStance

# paginated stances by user do not include user info, and use 
class PaginatedStancesByUserStance(BaseModel):
    id: int
    entity: StanceFeedEntity
    headline: str
    content_json: str
    num_comments: int
    average_rating: Optional[float]
    num_ratings: int
    my_rating: Optional[int]
    tags: List[StanceFeedTag]
    created_at: str
class PaginatedStancesByUserRequest(BaseModel):
    num_stances: int = 20
    cursor: Optional[str]
class PaginatedStancesByUserResponse(BaseModel):
    stances: List[PaginatedStancesByUserStance]
    next_cursor: Optional[str] = None