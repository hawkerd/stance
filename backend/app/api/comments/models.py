from pydantic import BaseModel


class CommentCreateRequest(BaseModel):
    content: str
    parent_id: int | None = None


class CommentReadResponse(BaseModel):
    id: int
    user_id: int
    stance_id: int
    content: str
    parent_id: int | None = None
    is_active: bool
    likes: int
    dislikes: int
    user_reaction: str | None
    count_nested: int
    created_at: str
    updated_at: str | None


class CommentUpdateRequest(BaseModel):
    content: str | None = None
    is_active: bool | None = None


class CommentUpdateResponse(BaseModel):
    id: int
    user_id: int
    stance_id: int
    content: str
    parent_id: int | None = None
    is_active: bool
    created_at: str
    updated_at: str | None


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
