from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.database.comment import create_comment, read_comment, update_comment, delete_comment, get_all_comments
from app.routers.models.comments import CommentCreateRequest, CommentReadResponse, CommentUpdateRequest, CommentUpdateResponse, CommentDeleteResponse
import logging

router = APIRouter()

@router.post("/comments", response_model=CommentReadResponse)
def create_comment_endpoint(request: CommentCreateRequest, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)) -> CommentReadResponse:
    try:
        comment = create_comment(db, user_id=user_id, stance_id=request.stance_id, content=request.content, parent_id=request.parent_id)
        if not comment:
            raise HTTPException(status_code=400, detail="Failed to create comment")
        return CommentReadResponse(
            id=comment.id,
            user_id=comment.user_id,
            stance_id=comment.stance_id,
            content=comment.content,
            parent_id=comment.parent_id,
            is_active=comment.is_active,
            created_at=str(comment.created_at),
            updated_at=str(comment.updated_at) if comment.updated_at else None
        )
    except Exception as e:
        logging.error(f"Error creating comment: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/comments/{comment_id}", response_model=CommentReadResponse)
def get_comment_endpoint(comment_id: int, db: Session = Depends(get_db)) -> CommentReadResponse:
    try:
        comment = read_comment(db, comment_id=comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        return CommentReadResponse(
            id=comment.id,
            user_id=comment.user_id,
            stance_id=comment.stance_id,
            content=comment.content,
            parent_id=comment.parent_id,
            is_active=comment.is_active,
            created_at=str(comment.created_at),
            updated_at=str(comment.updated_at) if comment.updated_at else None
        )
    except Exception as e:
        logging.error(f"Error reading comment {comment_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/comments/{comment_id}", response_model=CommentUpdateResponse)
def update_comment_endpoint(comment_id: int, request: CommentUpdateRequest, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)) -> CommentUpdateResponse:
    try:
        comment = read_comment(db, comment_id=comment_id)
        if not comment or comment.user_id != user_id:
            raise HTTPException(status_code=404, detail="Comment not found or not authorized")
        updated_comment = update_comment(db, comment_id=comment_id, **request.dict(exclude_unset=True))
        if not updated_comment:
            raise HTTPException(status_code=400, detail="Failed to update comment")
        return CommentUpdateResponse(
            id=updated_comment.id,
            user_id=updated_comment.user_id,
            stance_id=updated_comment.stance_id,
            content=updated_comment.content,
            parent_id=updated_comment.parent_id,
            is_active=updated_comment.is_active,
            created_at=str(updated_comment.created_at),
            updated_at=str(updated_comment.updated_at) if updated_comment.updated_at else None
        )
    except Exception as e:
        logging.error(f"Error updating comment {comment_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/comments/{comment_id}")
def delete_comment_endpoint(comment_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    try:
        comment = read_comment(db, comment_id=comment_id)
        if not comment or comment.user_id != user_id:
            raise HTTPException(status_code=404, detail="Comment not found or not authorized")
        success = delete_comment(db, comment_id=comment_id)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to delete comment")
        return CommentDeleteResponse(success=True)
    except Exception as e:
        logging.error(f"Error deleting comment {comment_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
