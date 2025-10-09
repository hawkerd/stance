from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_is_admin, get_current_user
from app.database.entity import create_entity, read_entity, update_entity, delete_entity, get_all_entities
from app.routers.models.entities import (
    EntityCreateRequest, EntityReadResponse, EntityUpdateRequest, EntityUpdateResponse, EntityDeleteResponse, EntityListResponse
)
from app.database.stance import get_user_stance_by_entity
from app.database.models.stance import Stance
from app.routers.models.stances import StanceReadResponse
import logging
from typing import Optional
from datetime import datetime

router = APIRouter(tags=["entities"])

@router.post("/entities", response_model=EntityReadResponse)
def create_entity_endpoint(request: EntityCreateRequest, db: Session = Depends(get_db), is_admin: bool = Depends(get_is_admin)) -> EntityReadResponse:
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    entity = create_entity(
        db,
        type=request.type,
        title=request.title,
        description=request.description,
        start_time=datetime.fromisoformat(request.start_time) if request.start_time else None,
        end_time=datetime.fromisoformat(request.end_time) if request.end_time else None
    )
    if not entity:
        raise HTTPException(status_code=400, detail="Failed to create entity")
    return EntityReadResponse(
        id=entity.id,
        type=entity.type,
        title=entity.title,
        description=entity.description,
        start_time=entity.start_time.isoformat() if entity.start_time else None,
        end_time=entity.end_time.isoformat() if entity.end_time else None
    )

@router.get("/entities/{entity_id}", response_model=EntityReadResponse)
def get_entity_endpoint(entity_id: int, db: Session = Depends(get_db)) -> EntityReadResponse:
    entity = read_entity(db, entity_id=entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    return EntityReadResponse(
        id=entity.id,
        type=entity.type,
        title=entity.title,
        description=entity.description,
        start_time=entity.start_time.isoformat() if entity.start_time else None,
        end_time=entity.end_time.isoformat() if entity.end_time else None
    )

@router.put("/entities/{entity_id}", response_model=EntityUpdateResponse)
def update_entity_endpoint(entity_id: int, request: EntityUpdateRequest, db: Session = Depends(get_db), is_admin: bool = Depends(get_is_admin)) -> EntityUpdateResponse:
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    entity = update_entity(db, entity_id=entity_id, **request.model_dump(exclude_unset=True))
    if not entity:
        raise HTTPException(status_code=400, detail="Failed to update entity")
    return EntityUpdateResponse(
        id=entity.id,
        type=entity.type,
        title=entity.title,
        description=entity.description,
        start_time=entity.start_time.isoformat() if entity.start_time else None,
        end_time=entity.end_time.isoformat() if entity.end_time else None
    )

@router.delete("/entities/{entity_id}", response_model=EntityDeleteResponse)
def delete_entity_endpoint(entity_id: int, db: Session = Depends(get_db), is_admin: bool = Depends(get_is_admin)) -> EntityDeleteResponse:
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    success = delete_entity(db, entity_id=entity_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete entity")
    return EntityDeleteResponse(success=True)

@router.get("/entities", response_model=EntityListResponse)
def get_all_entities_endpoint(db: Session = Depends(get_db)):
    entities = get_all_entities(db)
    return EntityListResponse(
        entities=[
            EntityReadResponse(
                id=entity.id,
                type=entity.type,
                title=entity.title,
                description=entity.description,
                start_time=entity.start_time.isoformat() if entity.start_time else None,
                end_time=entity.end_time.isoformat() if entity.end_time else None
            ) for entity in entities
        ]
    )


@router.get("/entities/{entity_id}/stances/me", response_model=Optional[StanceReadResponse])
def get_my_stance_for_event(entity_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)) -> Optional[StanceReadResponse]:
    stance: Optional[Stance] = get_user_stance_by_entity(db, entity_id=entity_id, user_id=user_id)
    if not stance:
        return None
    return StanceReadResponse(
        id=stance.id,
        user_id=stance.user_id,
        entity_id=stance.entity_id,
        headline=stance.headline,
        content_json=stance.content_json
    )