from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.database.stance import create_stance, update_stance, read_stance, delete_stance, get_stances_by_user
from app.routers.models.stances import StanceCreateRequest, StanceCreateResponse, StanceUpdateRequest, StanceUpdateResponse, StanceReadResponse, StanceDeleteResponse
import logging

router = APIRouter()

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
            stance=request.stance
        )
        if not stance_obj:
            raise HTTPException(status_code=400, detail="Failed to create stance")
        return StanceCreateResponse(
            id=stance_obj.id,
            user_id=stance_obj.user_id,
            event_id=stance_obj.event_id,
            issue_id=stance_obj.issue_id,
            stance=stance_obj.stance
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
            stance=stance.stance
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
            stance=request.stance
        )
        if not stance_obj:
            raise HTTPException(status_code=404, detail="Stance not found or not authorized")
        
        return StanceUpdateResponse(
            id=stance_obj.id,
            user_id=stance_obj.user_id,
            event_id=stance_obj.event_id,
            issue_id=stance_obj.issue_id,
            stance=stance_obj.stance
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