from pydantic import BaseModel
from typing import Optional

# API models

# read user
class UserReadResponse(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    email: str
