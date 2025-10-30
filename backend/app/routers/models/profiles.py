from pydantic import BaseModel
from typing import Optional

class ProfileCreateRequest(BaseModel):
    bio: Optional[str]
    avatar_url: Optional[str]
    pinned_stance_id: Optional[int]

class ProfileReadResponse(BaseModel):
    user_id: int
    bio: Optional[str]
    avatar_url: Optional[str]
    pinned_stance_id: Optional[int]

class ProfileUpdateRequest(BaseModel):
    bio: Optional[str]
    avatar_url: Optional[str]
    pinned_stance_id: Optional[int]

class ProfileUpdateResponse(BaseModel):
    user_id: int
    bio: Optional[str]
    avatar_url: Optional[str]
    pinned_stance_id: Optional[int]

class ProfilePageResponse(BaseModel):
    username: str
    bio: Optional[str]
    avatar_url: Optional[str]
    pinned_stance_id: Optional[int]
