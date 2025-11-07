from pydantic import BaseModel

class UserReadResponse(BaseModel):
    id: int
    username: str
    full_name: str
    email: str

class UserUpdateRequest(BaseModel):
    username: str | None = None
    full_name: str | None = None
    email: str | None = None

class UserListResponse(BaseModel):
    users: list[UserReadResponse]
    next_cursor: str | None = None

class DemographicCreateRequest(BaseModel):
    birth_year: int | None
    gender: str | None
    zip_code: str | None

class DemographicReadResponse(BaseModel):
    user_id: int
    birth_year: int | None
    gender: str | None
    zip_code: str | None

class DemographicUpdateRequest(BaseModel):
    birth_year: int | None
    gender: str | None
    zip_code: str | None

class DemographicUpdateResponse(BaseModel):
    user_id: int
    birth_year: int | None
    gender: str | None
    zip_code: str | None

class ProfileCreateRequest(BaseModel):
    bio: str | None
    avatar_url: str | None
    pinned_stance_id: int | None

class ProfileReadResponse(BaseModel):
    user_id: int
    bio: str | None
    avatar_url: str | None
    pinned_stance_id: int | None

class ProfileUpdateRequest(BaseModel):
    bio: str | None
    avatar_url: str | None
    pinned_stance_id: int | None

class ProfileUpdateResponse(BaseModel):
    user_id: int
    bio: str | None
    avatar_url: str | None
    pinned_stance_id: int | None

class ProfilePageResponse(BaseModel):
    username: str
    full_name: str
    follower_count: int
    following_count: int
    following: bool | None
    bio: str | None
    avatar_url: str | None
    pinned_stance_id: int | None
    pinned_stance_id_entity_id: int | None
