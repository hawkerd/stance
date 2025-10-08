from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user, get_current_user_optional
from app.database.comment import count_comment_nested_replies
from app.database.stance import create_stance, update_stance, read_stance, delete_stance, get_stances_by_user, get_stances_by_event, get_stances_by_issue, get_comments_by_stance, get_all_stances
from app.routers.models.stances import StanceCreateRequest, StanceCreateResponse, StanceUpdateRequest, StanceUpdateResponse, StanceReadResponse, StanceDeleteResponse, StanceListResponse
from app.routers.models.comments import CommentReadResponse, CommentListResponse
import logging
from typing import Optional

router = APIRouter(tags=["stances"])

@router.post("/stances", response_model=StanceCreateResponse)
def create_stance_endpoint(
    request: StanceCreateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
) -> StanceCreateResponse:
    try:
        logging.info(f"Creating stance for user {user_id} with event_id {request.event_id} and issue_id {request.issue_id}")

        # check if the user already has a stance for this event or issue
        existing_stances = get_stances_by_user(db, user_id)
        for stance in existing_stances:
            if (request.event_id is not None and stance.event_id == request.event_id) or \
               (request.issue_id is not None and stance.issue_id == request.issue_id):
                logging.warning(f"User {user_id} already has a stance for this event or issue")
                raise HTTPException(status_code=400, detail="User already has a stance for this event or issue")

        # create the stance
        stance_obj = create_stance(
            db,
            user_id=user_id,
            event_id=request.event_id,
            issue_id=request.issue_id,
            headline=request.headline,
            content_json=request.content_json
        )
        if not stance_obj:
            raise HTTPException(status_code=400, detail="Failed to create stance")
        return StanceCreateResponse(
            id=stance_obj.id,
            user_id=stance_obj.user_id,
            event_id=stance_obj.event_id,
            issue_id=stance_obj.issue_id,
            headline=stance_obj.headline,
            content_json=stance_obj.content_json
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/stances/{stance_id}", response_model=StanceReadResponse)
def get_stance_endpoint(
    stance_id: int,
    db: Session = Depends(get_db)
) -> StanceReadResponse:
    try:
        stance = read_stance(db, stance_id)
        if not stance:
            raise HTTPException(status_code=404, detail="Stance not found or not authorized")
        return StanceReadResponse(
            id=stance.id,
            user_id=stance.user_id,
            event_id=stance.event_id,
            issue_id=stance.issue_id,
            headline=stance.headline,
            content_json=stance.content_json
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/stances", response_model=StanceListResponse)
def get_stances_endpoint(db: Session = Depends(get_db)) -> StanceListResponse:
    try:
        stances = get_all_stances(db)
        return StanceListResponse(
            stances=[
                StanceReadResponse(
                    id=stance.id,
                    user_id=stance.user_id,
                    event_id=stance.event_id,
                    issue_id=stance.issue_id,
                    headline=stance.headline,
                    content_json=stance.content_json
                ) for stance in stances
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/stances/{stance_id}", response_model=StanceUpdateResponse)
def update_stance_endpoint(
    stance_id: int,
    request: StanceUpdateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
) -> StanceUpdateResponse:
    try:
        logging.info(f"Updating stance {stance_id} for user {user_id}")
        # read the current stance
        stance = read_stance(db, stance_id)
        if not stance or stance.user_id != user_id:
            raise HTTPException(status_code=404, detail="Stance not found or not authorized")

        # update the stance
        stance_obj = update_stance(
            db,
            stance_id=stance_id,
            headline=request.headline,
            content_json=request.content_json
        )
        if not stance_obj:
            raise HTTPException(status_code=404, detail="Stance not found or not authorized")
        
        return StanceUpdateResponse(
            id=stance_obj.id,
            user_id=stance_obj.user_id,
            event_id=stance_obj.event_id,
            issue_id=stance_obj.issue_id,
            headline=stance_obj.headline,
            content_json=stance_obj.content_json
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/stances/{stance_id}", response_model=StanceDeleteResponse)
def delete_stance_endpoint(
    stance_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
) -> StanceDeleteResponse:
    try:
        logging.info(f"Deleting stance {stance_id} for user {user_id}")
        # read the current stance
        stance = read_stance(db, stance_id)
        if not stance or stance.user_id != user_id:
            raise HTTPException(status_code=404, detail="Stance not found or not authorized")
        
        success = delete_stance(db, stance_id)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to delete stance")

        return StanceDeleteResponse(success=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
    
@router.get("/stances/issue/{issue_id}", response_model=StanceListResponse)
def get_stances_by_issue_endpoint(
    issue_id: int,
    db: Session = Depends(get_db)
) -> StanceListResponse:
    try:
        stances = get_stances_by_issue(db, issue_id)
        return StanceListResponse(
            stances=[
                StanceReadResponse(
                    id=stance.id,
                    user_id=stance.user_id,
                    event_id=stance.event_id,
                    issue_id=stance.issue_id,
                    headline=stance.headline,
                    content_json=stance.content_json
                ) for stance in stances
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
    
@router.get("/stances/event/{event_id}", response_model=StanceListResponse)
def get_stances_by_event_endpoint(
    event_id: int,
    db: Session = Depends(get_db)
) -> StanceListResponse:
    try:
        stances = get_stances_by_event(db, event_id)
        return StanceListResponse(
            stances=[
                StanceReadResponse(
                    id=stance.id,
                    user_id=stance.user_id,
                    event_id=stance.event_id,
                    issue_id=stance.issue_id,
                    headline=stance.headline,
                    content_json=stance.content_json
                ) for stance in stances
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
    
@router.get("/stances/{stance_id}/comments", response_model=CommentListResponse)
def get_comments_by_stance_endpoint(
    stance_id: int,
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_optional)
) -> CommentListResponse:
    try:
        comments = get_comments_by_stance(db, stance_id, False)
        comment_responses = []

        for comment in comments:
            likes = sum(1 for r in comment.reactions if r.is_like)
            dislikes = sum(1 for r in comment.reactions if not r.is_like)

            if current_user_id is None:
                user_reaction = None
            else:
                user_reaction_obj = next((r for r in comment.reactions if r.user_id == current_user_id), None)
                user_reaction = (
                    "like" if user_reaction_obj and user_reaction_obj.is_like else
                    "dislike" if user_reaction_obj and not user_reaction_obj.is_like else
                    None
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
                    count_nested=count_comment_nested_replies(db, comment.id),
                    created_at=str(comment.created_at),
                    updated_at=str(comment.updated_at) if comment.updated_at else None
                )
            )

        return CommentListResponse(comments=comment_responses)

    except Exception as e:
        logging.error(f"Error getting comments for stance {stance_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
