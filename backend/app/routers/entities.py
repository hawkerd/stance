from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_is_admin, get_current_user
from app.database.entity import create_entity, read_entity, update_entity, delete_entity, get_all_entities
from app.routers.models.entities import (
    EntityCreateRequest, EntityReadResponse, EntityUpdateRequest, EntityUpdateResponse, EntityDeleteResponse, EntityListResponse, TagResponse
)
from app.database.stance import get_user_stance_by_entity
from app.database.models.stance import Stance
from app.routers.models.stances import StanceReadResponse
from app.service.storage import upload_image_to_storage
import logging
from typing import Optional
from datetime import datetime
import json
import base64
from app.database.models.tag import Tag
from app.database.models.entity_tag import EntityTag
from app.database.tag import create_tag, find_tag, get_tag
from app.database.entity_tag import create_entity_tag, find_entity_tag, get_tags_for_entity, delete_entity_tags_for_entity

router = APIRouter(tags=["entities"])

@router.post("/entities", response_model=EntityReadResponse)
def create_entity_endpoint(request: EntityCreateRequest, db: Session = Depends(get_db), is_admin: bool = Depends(get_is_admin)) -> EntityReadResponse:
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    # Upload images and get URLs
    image_urls = []
    if request.images:
        for img in request.images:
            img_bytes = base64.b64decode(img)
            url = upload_image_to_storage(img_bytes, "image/jpeg")
            image_urls.append(url)
    images_json = json.dumps(image_urls)

    # create the entity
    entity = create_entity(
        db,
        type=request.type,
        title=request.title,
        description=request.description,
        start_time=datetime.fromisoformat(request.start_time) if request.start_time else None,
        end_time=datetime.fromisoformat(request.end_time) if request.end_time else None,
        images_json=images_json
    )
    if not entity:
        raise HTTPException(status_code=400, detail="Failed to create entity")

    # handle tags
    tags_response = []
    for tag_req in request.tags:
        tag = find_tag(db, name=tag_req.name, tag_type=tag_req.tag_type)
        if not tag:
            tag = create_tag(db, name=tag_req.name, tag_type=tag_req.tag_type)
        # Check if the entity_tag already exists to avoid duplicates
        entity_tag = find_entity_tag(db, entity_id=entity.id, tag_id=tag.id)
        if not entity_tag:
            create_entity_tag(db, entity_id=entity.id, tag_id=tag.id)
        tags_response.append(TagResponse(id=tag.id, name=tag.name, tag_type=tag.tag_type))


    return EntityReadResponse(
        id=entity.id,
        type=entity.type,
        title=entity.title,
        description=entity.description,
        start_time=entity.start_time.isoformat() if entity.start_time else None,
        end_time=entity.end_time.isoformat() if entity.end_time else None,
        images_json=entity.images_json,
        tags=tags_response
    )

@router.get("/entities/{entity_id}", response_model=EntityReadResponse)
def get_entity_endpoint(entity_id: int, db: Session = Depends(get_db)) -> EntityReadResponse:
    # find the entity
    entity = read_entity(db, entity_id=entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")

    # get tags
    tags_response = []
    entity_tags = get_tags_for_entity(db, entity_id=entity_id)
    for et in entity_tags:
        tag = get_tag(db, tag_id=et.tag_id)
        if tag:
            tags_response.append(TagResponse(id=tag.id, name=tag.name, tag_type=tag.tag_type))

    return EntityReadResponse(
        id=entity.id,
        type=entity.type,
        title=entity.title,
        images_json=entity.images_json,
        tags=tags_response,
        description=entity.description,
        start_time=entity.start_time.isoformat() if entity.start_time else None,
        end_time=entity.end_time.isoformat() if entity.end_time else None,
    )

@router.put("/entities/{entity_id}", response_model=EntityUpdateResponse)
def update_entity_endpoint(entity_id: int, request: EntityUpdateRequest, db: Session = Depends(get_db), is_admin: bool = Depends(get_is_admin)) -> EntityUpdateResponse:
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    # images
    image_urls = []
    if request.images:
        for img in request.images:
            img_bytes = base64.b64decode(img)
            url = upload_image_to_storage(img_bytes, "image/jpeg")
            image_urls.append(url)
    images_json = json.dumps(image_urls)

    # new tags
    delete_entity_tags_for_entity(db, entity_id)
    tags_response = []
    for tag_req in request.tags:
        tag = find_tag(db, name=tag_req.name, tag_type=tag_req.tag_type)
        if not tag:
            tag = create_tag(db, name=tag_req.name, tag_type=tag_req.tag_type)
        entity_tag = find_entity_tag(db, entity_id=entity_id, tag_id=tag.id)
        if not entity_tag:
            create_entity_tag(db, entity_id=entity_id, tag_id=tag.id)
        tags_response.append(TagResponse(id=tag.id, name=tag.name, tag_type=tag.tag_type))

    entity = update_entity(db, entity_id=entity_id, images_json=images_json, description=request.description, start_time=datetime.fromisoformat(request.start_time) if request.start_time else None, end_time=datetime.fromisoformat(request.end_time) if request.end_time else None, title=request.title)
    if not entity:
        raise HTTPException(status_code=400, detail="Failed to update entity")
    return EntityUpdateResponse(
        id=entity.id,
        type=entity.type,
        title=entity.title,
        description=entity.description,
        start_time=entity.start_time.isoformat() if entity.start_time else None,
        end_time=entity.end_time.isoformat() if entity.end_time else None,
        images_json=entity.images_json,
        tags=tags_response
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
    entity_list = []
    for entity in entities:
        tags_response = []
        entity_tags = get_tags_for_entity(db, entity_id=entity.id)
        for et in entity_tags:
            tag = get_tag(db, tag_id=et.tag_id)
            if tag:
                tags_response.append(TagResponse(id=tag.id, name=tag.name, tag_type=tag.tag_type))
        entity_list.append(
            EntityReadResponse(
                id=entity.id,
                type=entity.type,
                title=entity.title,
                description=entity.description,
                images_json=entity.images_json,
                start_time=entity.start_time.isoformat() if entity.start_time else None,
                end_time=entity.end_time.isoformat() if entity.end_time else None,
                tags=tags_response
            )
        )
    return EntityListResponse(entities=entity_list)


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