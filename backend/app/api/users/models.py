from pydantic import BaseModel
from typing import Optional

class UserReadResponse(BaseModel):
    id: int
    username: str
    full_name: str
    email: str

class UserListResponse(BaseModel):
    users: list[UserReadResponse]

class DemographicCreateRequest(BaseModel):
    birth_year: Optional[int]
    gender: Optional[str]
    zip_code: Optional[str]

class DemographicReadResponse(BaseModel):
    user_id: int
    birth_year: Optional[int]
    gender: Optional[str]
    zip_code: Optional[str]

class DemographicUpdateRequest(BaseModel):
    birth_year: Optional[int]
    gender: Optional[str]
    zip_code: Optional[str]

class DemographicUpdateResponse(BaseModel):
    user_id: int
    birth_year: Optional[int]
    gender: Optional[str]
    zip_code: Optional[str]

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
    full_name: str
    follower_count: int
    following_count: int
    following: Optional[bool]
    bio: Optional[str]
    avatar_url: Optional[str]
    pinned_stance_id: Optional[int]
    pinned_stance_id_entity_id: Optional[int]
