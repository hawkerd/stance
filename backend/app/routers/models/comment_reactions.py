from pydantic import BaseModel
from typing import Optional

class CommentReactionCreateRequest(BaseModel):
    is_like: bool

class CommentReactionReadResponse(BaseModel):
    id: int
    user_id: int
    comment_id: int
    is_like: bool