from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.dependencies import *
from app.database.models import *
from .models import *
from .dependencies import *
import app.database.comment as comment_db
import app.database.comment_reaction as comment_reaction_db
import app.database.stance as stance_db

router = APIRouter(
    tags=["comments"], prefix="/entities/{entity_id}/stances/{stance_id}/comments"
)


# function to validate comment ownership
def validate_comment_ownership(comment: Comment, user_id: int) -> None:
    if comment.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this comment",
        )


@router.post("/", response_model=CommentReadResponse)
def create_comment_endpoint(
    request: CommentCreateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
    entity_stance: tuple[Entity, Stance] = Depends(validate_entity_stance),
) -> CommentReadResponse:
    try:
        # create the comment (entity and stance already validated)
        comment: Comment = comment_db.create_comment(
            db,
            user_id=user_id,
            stance_id=entity_stance[1].id,
            content=request.content,
            parent_id=request.parent_id,
        )
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
            count_nested=comment_db.count_comment_nested_replies(db, comment.id),
            created_at=str(comment.created_at),
            updated_at=str(comment.updated_at) if comment.updated_at else None,
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating comment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/", response_model=CommentListResponse)
def get_comments_endpoint(
    db: Session = Depends(get_db),
    current_user_id: int | None = Depends(get_current_user_optional),
    entity_stance: tuple[Entity, Stance] = Depends(validate_entity_stance),
) -> CommentListResponse:
    try:
        stance: Stance = entity_stance[1]

        comments: list[Comment] = stance_db.get_comments_by_stance(db, stance.id, False)
        comment_responses: list[CommentReadResponse] = []

        for comment in comments:
            likes: int = sum(1 for r in comment.reactions if r.is_like)
            dislikes: int = sum(1 for r in comment.reactions if not r.is_like)

            if current_user_id is None:
                user_reaction = None
            else:
                user_reaction_obj = next(
                    (r for r in comment.reactions if r.user_id == current_user_id), None
                )
                user_reaction = (
                    "like"
                    if user_reaction_obj and user_reaction_obj.is_like
                    else (
                        "dislike"
                        if user_reaction_obj and not user_reaction_obj.is_like
                        else None
                    )
                )

            comment_responses.append(
                CommentReadResponse(
                    id=comment.id,
                    user_id=comment.user_id,
                    stance_id=comment.stance_id,
                    content=comment.content,
                    parent_id=comment.parent_id,
                    is_active=comment.is_active,
                    likes=likes,
                    dislikes=dislikes,
                    user_reaction=user_reaction,
                    count_nested=comment_db.count_comment_nested_replies(
                        db, comment.id
                    ),
                    created_at=str(comment.created_at),
                    updated_at=str(comment.updated_at) if comment.updated_at else None,
                )
            )

        return CommentListResponse(comments=comment_responses)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting comments for stance {entity_stance[1].id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/{comment_id}", response_model=CommentReadResponse)
def get_comment_endpoint(
    db: Session = Depends(get_db),
    current_user_id: int | None = Depends(get_current_user_optional),
    entity_stance_comment: tuple[Entity, Stance, Comment] = Depends(
        validate_entity_stance_comment
    ),
) -> CommentReadResponse:
    try:
        # read the comment
        comment: Comment = entity_stance_comment[2]

        # calculate likes and dislikes
        likes: int = sum(1 for r in comment.reactions if r.is_like)
        dislikes: int = sum(1 for r in comment.reactions if not r.is_like)

        # user reaction
        if current_user_id is None:
            user_reaction = None
        else:
            user_reaction_obj = next(
                (r for r in comment.reactions if r.user_id == current_user_id), None
            )
            user_reaction = (
                None
                if not user_reaction_obj
                else "like" if user_reaction_obj.is_like else "dislike"
            )

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
            count_nested=comment_db.count_comment_nested_replies(db, comment.id),
            created_at=str(comment.created_at),
            updated_at=str(comment.updated_at) if comment.updated_at else None,
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error reading comment {comment.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.put("/{comment_id}", response_model=CommentUpdateResponse)
def update_comment_endpoint(
    request: CommentUpdateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
    entity_stance_comment: tuple[Entity, Stance, Comment] = Depends(
        validate_entity_stance_comment
    ),
) -> CommentUpdateResponse:
    try:
        comment: Comment = entity_stance_comment[2]

        # validate ownership
        validate_comment_ownership(comment, user_id)

        # update the comment
        updated_comment: Comment | None = comment_db.update_comment(
            db, comment_id=comment.id, request=request.dict(exclude_unset=True)
        )
        if not updated_comment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update comment",
            )

        return CommentUpdateResponse(
            id=updated_comment.id,
            user_id=updated_comment.user_id,
            stance_id=updated_comment.stance_id,
            content=updated_comment.content,
            parent_id=updated_comment.parent_id,
            is_active=updated_comment.is_active,
            created_at=str(updated_comment.created_at),
            updated_at=(
                str(updated_comment.updated_at) if updated_comment.updated_at else None
            ),
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating comment {comment.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment_endpoint(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
    entity_stance_comment: tuple[Entity, Stance, Comment] = Depends(
        validate_entity_stance_comment
    ),
) -> None:
    try:
        comment: Comment = entity_stance_comment[2]

        # validate ownership
        validate_comment_ownership(comment, user_id)

        # delete the comment
        success: bool = comment_db.delete_comment(db, comment_id=comment.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error",
            )

        return
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting comment {comment.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/{comment_id}/replies", response_model=CommentListResponse)
def get_comment_replies_endpoint(
    db: Session = Depends(get_db),
    user_id: int | None = Depends(get_current_user_optional),
    entity_stance_comment: tuple[Entity, Stance, Comment] = Depends(
        validate_entity_stance_comment
    ),
) -> CommentListResponse:
    try:
        comment: Comment = entity_stance_comment[2]

        # fetch comment replies
        replies: list[Comment] = comment_db.get_comment_replies(
            db, comment_id=comment.id
        )
        reply_responses: list[CommentReadResponse] = []

        # construct response
        for reply in replies:
            likes: int = sum(1 for r in reply.reactions if r.is_like)
            dislikes: int = sum(1 for r in reply.reactions if not r.is_like)

            if user_id is None:
                user_reaction = None
            else:
                user_reaction_obj = next(
                    (r for r in reply.reactions if r.user_id == user_id), None
                )
                user_reaction = (
                    None
                    if not user_reaction_obj
                    else "like" if user_reaction_obj.is_like else "dislike"
                )

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
                    count_nested=comment_db.count_comment_nested_replies(db, reply.id),
                    created_at=str(reply.created_at),
                    updated_at=str(reply.updated_at) if reply.updated_at else None,
                )
            )
        return CommentListResponse(comments=reply_responses)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting replies for comment {comment.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.post("/{comment_id}/reaction", status_code=status.HTTP_201_CREATED)
def react_to_comment(
    request: CommentReactionCreateRequest,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
    entity_stance_comment: tuple[Entity, Stance, Comment] = Depends(
        validate_entity_stance_comment
    ),
):
    try:
        comment: Comment = entity_stance_comment[2]

        # query for existing entry
        existing_reaction: CommentReaction | None = (
            comment_reaction_db.read_comment_reaction_by_user_and_comment(
                db, current_user, comment.id
            )
        )

        # create new if needed
        if not existing_reaction:
            new_reaction: CommentReaction = comment_reaction_db.create_comment_reaction(
                db, current_user, comment.id, request.is_like
            )
            return

        # if no need to update, return
        if existing_reaction.is_like == request.is_like:
            return

        # update
        updated_reaction: CommentReaction | None = (
            comment_reaction_db.update_comment_reaction(
                db, existing_reaction.id, request.is_like
            )
        )
        if updated_reaction:
            return

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update reaction",
        )

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error reacting to comment {comment.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.delete("/{comment_id}/reaction", status_code=status.HTTP_204_NO_CONTENT)
def remove_comment_reaction(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
    entity_stance_comment: tuple[Entity, Stance, Comment] = Depends(
        validate_entity_stance_comment
    ),
):
    try:
        comment: Comment = entity_stance_comment[2]

        # find the reaction
        reaction: CommentReaction | None = (
            comment_reaction_db.read_comment_reaction_by_user_and_comment(
                db, current_user, comment.id
            )
        )
        if not reaction or reaction.user_id != current_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Reaction not found"
            )

        # delete the reaction
        success: bool = comment_reaction_db.delete_comment_reaction(db, reaction.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete reaction",
            )
        return
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error removing reaction for comment {comment.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
