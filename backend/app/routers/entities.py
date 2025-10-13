from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_is_admin, get_current_user, get_current_user_optional
from app.database.entity import create_entity, read_entity, update_entity, delete_entity, get_all_entities, get_random_entities
from app.routers.models import (
    EntityCreateRequest, EntityReadResponse, EntityUpdateRequest, EntityUpdateResponse, EntityDeleteResponse, EntityListResponse, TagResponse, EntityFeedRequest, EntityFeedResponse, EntityFeedEntity, EntityFeedStance, EntityFeedTag
)
from app.database.rating import get_average_rating_for_stance
from app.database.stance import get_user_stance_by_entity, get_n_stances_by_entity
from app.database.models import Stance, Entity, Tag
from app.routers.models import StanceReadResponse
from app.service.storage import upload_image_to_storage
import logging
from typing import Optional, List
from datetime import datetime
import json
import base64
from app.database.tag import create_tag, find_tag
from app.database.entity_tag import create_entity_tag, find_entity_tag, delete_entity_tags_for_entity, get_tags_for_entity

router = APIRouter(tags=["entities"], prefix="/entities")

@router.post("/", response_model=EntityReadResponse)
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

@router.get("/{entity_id}", response_model=EntityReadResponse)
def get_entity_endpoint(entity_id: int, db: Session = Depends(get_db)) -> EntityReadResponse:
    # find the entity
    entity = read_entity(db, entity_id=entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")

    # get tags
    tags: List[Tag] = get_tags_for_entity(db, entity.id)

    return EntityReadResponse(
        id=entity.id,
        type=entity.type,
        title=entity.title,
        images_json=entity.images_json,
        tags=[TagResponse(id=t.id, name=t.name, tag_type=t.tag_type) for t in tags],
        description=entity.description,
        start_time=entity.start_time.isoformat() if entity.start_time else None,
        end_time=entity.end_time.isoformat() if entity.end_time else None,
    )

@router.put("/{entity_id}", response_model=EntityUpdateResponse)
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

@router.delete("/{entity_id}", response_model=EntityDeleteResponse)
def delete_entity_endpoint(entity_id: int, db: Session = Depends(get_db), is_admin: bool = Depends(get_is_admin)) -> EntityDeleteResponse:
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    success = delete_entity(db, entity_id=entity_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete entity")
    return EntityDeleteResponse(success=True)

@router.get("/", response_model=EntityListResponse)
def get_all_entities_endpoint(db: Session = Depends(get_db)):
    entities = get_all_entities(db)
    entity_list = []
    for entity in entities:
        # get tags
        tags: List[Tag] = get_tags_for_entity(db, entity.id)
        entity_list.append(
            EntityReadResponse(
                id=entity.id,
                type=entity.type,
                title=entity.title,
                description=entity.description,
                images_json=entity.images_json,
                start_time=entity.start_time.isoformat() if entity.start_time else None,
                end_time=entity.end_time.isoformat() if entity.end_time else None,
                tags=[TagResponse(id=t.id, name=t.name, tag_type=t.tag_type) for t in tags]
            )
        )
    return EntityListResponse(entities=entity_list)


@router.get("/{entity_id}/stances/me", response_model=Optional[StanceReadResponse])
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

@router.post("/feed", response_model=EntityFeedResponse)
def get_home_feed(
    request: EntityFeedRequest,
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_optional)
) -> EntityFeedResponse:
    try:
        # get <=n random entities
        entities: List[Entity] = get_random_entities(db, n=request.num_entities)
        if not entities:
            return []

        feed_entities: List[EntityFeedEntity] = []
        for entity in entities:
            # fetch tags
            tags: List[Tag] = get_tags_for_entity(db, entity.id)
            feed_tags: List[EntityFeedTag] = [EntityFeedTag(id=t.id, name=t.name, tag_type=t.tag_type) for t in tags]

            # stances
            stances: List[Stance] = get_n_stances_by_entity(db, entity.id, request.num_stances_per_entity)
            feed_stances: List[EntityFeedStance] = []
            for s in stances:
                avg_rating = get_average_rating_for_stance(db, s.id)
                feed_stances.append(EntityFeedStance(id=s.id, headline=s.headline, average_rating=avg_rating))

            feed_entity = EntityFeedEntity(
                id=entity.id,
                type=entity.type,
                title=entity.title,
                images_json=entity.images_json,
                tags=feed_tags,
                stances=feed_stances,
                description=entity.description,
                start_time=entity.start_time.isoformat() if entity.start_time else None,
                end_time=entity.end_time.isoformat() if entity.end_time else None
            )
            feed_entities.append(feed_entity)

        return EntityFeedResponse(entities=feed_entities)

    except Exception as e:
        logging.error(f"Error fetching home feed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch home feed")