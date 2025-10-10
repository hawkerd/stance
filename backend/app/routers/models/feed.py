from pydantic import BaseModel
from typing import List, Optional

class HomeFeedStance(BaseModel):
    id: int
    headline: str
class HomeFeedTag(BaseModel):
    id: int
    name: str
    tag_type: int
class HomeFeedEntity(BaseModel):
    id: int
    type: int
    title: str
    images_json: str
    tags: List[HomeFeedTag]
    stances: List[HomeFeedStance]
    description: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class HomeFeedRequest(BaseModel):
    num_entities: int = 10
    num_stances_per_entity: int = 15
class HomeFeedResponse(BaseModel):
    entities: List[HomeFeedEntity]