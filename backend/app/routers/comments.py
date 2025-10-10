from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user, get_current_user_optional
from app.database.comment import create_comment, read_comment, update_comment, delete_comment, get_all_comments, get_comment_replies, count_comment_nested_replies
from app.routers.models import CommentCreateRequest, CommentReadResponse, CommentUpdateRequest, CommentUpdateResponse, CommentDeleteResponse, CommentListResponse
import logging
from typing import Optional

router = APIRouter(tags=["comments"])

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
            likes=0,
            dislikes=0,
            user_reaction=None,
            count_nested=count_comment_nested_replies(db, comment.id),
            created_at=str(comment.created_at),
            updated_at=str(comment.updated_at) if comment.updated_at else None
        )
    except Exception as e:
        logging.error(f"Error creating comment: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/comments/{comment_id}", response_model=CommentReadResponse)
def get_comment_endpoint(comment_id: int, db: Session = Depends(get_db), current_user_id: Optional[int] = Depends(get_current_user_optional)) -> CommentReadResponse:
    try:
        comment = read_comment(db, comment_id=comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        # calculate likes and dislikes
        likes = sum(1 for r in comment.reactions if r.is_like)
        dislikes = sum(1 for r in comment.reactions if not r.is_like)

        # user reaction
        if current_user_id is None:
            user_reaction = None
        else:
            user_reaction_obj = next((r for r in comment.reactions if r.user_id == current_user_id), None)
            user_reaction = None if not user_reaction_obj else "like" if user_reaction_obj.is_like else "dislike"

        return CommentReadResponse(
            id=comment.id,
            user_id=comment.user_id,
            stance_id=comment.stance_id,
            content=comment.content,
            parent_id=comment.parent_id,
            is_active=comment.is_active,
            likes=likes,
            dislikes=dislikes,
            user_reaction=user_reaction,
            count_nested=count_comment_nested_replies(db, comment.id),
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

@router.delete("/comments/{comment_id}", response_model=CommentDeleteResponse)
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
    
@router.get("/comments/{comment_id}/replies", response_model=CommentListResponse)
def get_comment_replies_endpoint(comment_id: int, db: Session = Depends(get_db), user_id: Optional[int] = Depends(get_current_user_optional)) -> CommentListResponse:
    try:
        replies = get_comment_replies(db, comment_id=comment_id)
        reply_responses = []
        for reply in replies:
            likes = sum(1 for r in reply.reactions if r.is_like)
            dislikes = sum(1 for r in reply.reactions if not r.is_like)

            if user_id is None:
                user_reaction = None
            else:
                user_reaction_obj = next((r for r in reply.reactions if r.user_id == user_id), None)
                user_reaction = None if not user_reaction_obj else "like" if user_reaction_obj.is_like else "dislike"

            reply_responses.append(
                CommentReadResponse(
                    id=reply.id,
                    user_id=reply.user_id,
                    stance_id=reply.stance_id,
                    content=reply.content,
                    parent_id=reply.parent_id,
                    is_active=reply.is_active,
                    likes=likes,
                    dislikes=dislikes,
                    user_reaction=user_reaction,
                    count_nested=count_comment_nested_replies(db, reply.id),
                    created_at=str(reply.created_at),
                    updated_at=str(reply.updated_at) if reply.updated_at else None
                )
            )
        return CommentListResponse(comments=reply_responses)
    except Exception as e:
        logging.error(f"Error getting replies for comment {comment_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")