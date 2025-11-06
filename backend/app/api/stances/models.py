from pydantic import BaseModel

class StanceCreateRequest(BaseModel):
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
    average_rating: float | None

class StanceUpdateRequest(BaseModel):
    headline: str | None = None
    content_json: str | None = None

class StanceUpdateResponse(BaseModel):
    id: int
    user_id: int
    entity_id: int
    headline: str
    content_json: str
    average_rating: float | None

class StanceDeleteResponse(BaseModel):
    success: bool

class StanceListResponse(BaseModel):
    stances: list[StanceReadResponse]


class ReadStanceRatingResponse(BaseModel):
    rating: int | None = None

class StanceRateRequest(BaseModel):
    rating: int | None = None

class StanceRateResponse(BaseModel):
    success: bool

class NumRatingsResponse(BaseModel):
    num_ratings: int


class StanceFeedCursor(BaseModel):
    score: float | None
    id: int | None
class StanceFeedTag(BaseModel):
    id: int
    name: str
    tag_type: int
class StanceFeedUser(BaseModel):
    id: int
    username: str
    avatar_url: str | None
class StanceFeedEntity(BaseModel):
    id: int
    type: int
    title: str
    images_json: str
    tags: list[StanceFeedTag]
    description: str | None = None
    start_time: str | None = None
    end_time: str | None = None
class StanceFeedStance(BaseModel):
    id: int
    user: StanceFeedUser
    entity: StanceFeedEntity
    headline: str
    content_json: str
    num_comments: int
    average_rating: float | None
    num_ratings: int
    my_rating: int | None
    tags: list[StanceFeedTag]
    created_at: str
class StanceFeedRequest(BaseModel):
    num_stances: int = 20
    initial_stance_id: int | None
    entities: list[int] | None
    cursor: StanceFeedCursor | None = None
class StanceFeedResponse(BaseModel):
    stances: list[StanceFeedStance]
    next_cursor: StanceFeedCursor | None = None
class StanceFeedStanceResponse(BaseModel):
    stance: StanceFeedStance


# following feed
class StanceFollowingFeedRequest(BaseModel):
    num_stances: int = 20
    cursor: str | None = None
class StanceFollowingFeedResponse(BaseModel):
    stances: list[StanceFeedStance]
    next_cursor: str | None = None

# paginated stances by entity do not include entity info, and use a str for cursor
class PaginatedStancesByEntityStance(BaseModel):
    id: int
    user: StanceFeedUser
    headline: str
    content_json: str
    num_comments: int
    average_rating: float | None
    num_ratings: int
    my_rating: int | None
    tags: list[StanceFeedTag]
    created_at: str | None = None
class PaginatedStancesByEntityCursor(BaseModel):
    score: float
    id: int
class PaginatedStanceByEntityRequest(BaseModel):
    num_stances: int = 20
    cursor: PaginatedStancesByEntityCursor | None
class EntityStancesResponse(BaseModel):
    stances: list[PaginatedStancesByEntityStance]
    next_cursor: PaginatedStancesByEntityCursor | None
class PaginatedStancesByEntityStanceResponse(BaseModel):
    stance: PaginatedStancesByEntityStance

# paginated stances by user do not include user info, and use 
class PaginatedStancesByUserStance(BaseModel):
    id: int
    entity: StanceFeedEntity
    headline: str
    content_json: str
    num_comments: int
    average_rating: float | None
    num_ratings: int
    my_rating: int | None
    tags: list[StanceFeedTag]
    created_at: str
class PaginatedStancesByUserRequest(BaseModel):
    num_stances: int = 20
    cursor: str | None
class UserStancesResponse(BaseModel):
    stances: list[PaginatedStancesByUserStance]
    next_cursor: str | None = None