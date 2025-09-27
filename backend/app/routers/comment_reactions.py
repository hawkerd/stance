from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database.comment_reaction import (
    create_comment_reaction,
    update_comment_reaction,
    delete_comment_reaction,
    read_comment_reaction,
    read_comment_reaction_by_user_and_comment
)
from app.database.models.comment_reaction import CommentReaction
from app.routers.models.comment_reactions import CommentReactionCreateRequest, CommentReactionReadResponse
from app.dependencies import get_current_user, get_db

router = APIRouter(prefix="/comment-reactions", tags=["comment-reactions"])


@router.post("/{comment_id}", response_model=CommentReactionReadResponse)
def react_to_comment(
    request: CommentReactionCreateRequest,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
) -> CommentReactionReadResponse:
    # query for existing entry
    existing = db.query(CommentReaction).filter_by(user_id=current_user, comment_id=comment_id).first()
    if existing:
        # update if necessary
        if existing.is_like != request.is_like:
            updated = update_comment_reaction(db, existing.id, request.is_like)
            return CommentReactionReadResponse(
                id=updated.id,
                user_id=updated.user_id,
                comment_id=updated.comment_id,
                is_like=updated.is_like
            )
        
        # if not necessary, return existing
        return CommentReactionReadResponse(
            id=existing.id,
            user_id=existing.user_id,
            comment_id=existing.comment_id,
            is_like=existing.is_like
        )
    # create new entry
    reaction = create_comment_reaction(db, current_user, comment_id, request.is_like)
    return CommentReactionReadResponse(
        id=reaction.id,
        user_id=reaction.user_id,
        comment_id=reaction.comment_id,
        is_like=reaction.is_like
    )

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_comment_reaction(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    reaction = read_comment_reaction_by_user_and_comment(db, current_user, comment_id)
    if not reaction or reaction.user_id != current_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reaction not found")
    success = delete_comment_reaction(db, reaction.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete reaction")
    return