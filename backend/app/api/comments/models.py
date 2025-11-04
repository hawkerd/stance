from pydantic import BaseModel
from typing import Optional

class CommentCreateRequest(BaseModel):
    content: str
    parent_id: Optional[int] = None

class CommentReadResponse(BaseModel):
    id: int
    user_id: int
    stance_id: int
    content: str
    parent_id: Optional[int] = None
    is_active: bool
    likes: int
    dislikes: int
    user_reaction: str | None
    count_nested: int
    created_at: str
    updated_at: Optional[str]

class CommentUpdateRequest(BaseModel):
    content: Optional[str] = None
    is_active: Optional[bool] = None

class CommentUpdateResponse(BaseModel):
    id: int
    user_id: int
    stance_id: int
    content: str
    parent_id: Optional[int] = None
    is_active: bool
    created_at: str
    updated_at: Optional[str]

class CommentDeleteResponse(BaseModel):
    success: bool

class CommentListResponse(BaseModel):
    comments: list[CommentReadResponse]

class CommentReactionCreateRequest(BaseModel):
    is_like: bool

class CommentReactionReadResponse(BaseModel):
    id: int
    user_id: int
    comment_id: int
    is_like: bool