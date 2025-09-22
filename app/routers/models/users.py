from pydantic import BaseModel
from typing import Optional

# API models

# create user
class UserCreateRequest(BaseModel):
    username: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    email: str
    password_hash: str
class UserCreateResponse(BaseModel):
    success: bool
