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