from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
from typing import Optional, List
from datetime import datetime
import json
import base64

from app.database.models import *
from app.dependencies import *
from app.database import (
    entity as entity_db,
    rating as rating_db,
    stance as stance_db,
    tag as tag_db,
    entity_tag as entity_tag_db
)
from app.service.storage import *
from .models import *
from .dependencies import *

router = APIRouter(tags=["entities"], prefix="/entities")

@router.post("/", response_model=EntityReadResponse)
def create_entity_endpoint(
    request: EntityCreateRequest,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(get_is_admin)
) -> EntityReadResponse:
    try:
        if not is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
        
        # Upload images and get URLs
        image_urls: List[str] = []
        if request.images:
            for img in request.images:
                img_bytes: bytes = base64.b64decode(img)
                url: str = upload_image_to_storage(img_bytes, "image/jpeg")
                image_urls.append(url)
        images_json: str = json.dumps(image_urls)

        # create the entity
        entity: Entity = entity_db.create_entity(
            db,
            type=request.type,
            title=request.title,
            description=request.description,
            start_time=datetime.fromisoformat(request.start_time) if request.start_time else None,
            end_time=datetime.fromisoformat(request.end_time) if request.end_time else None,
            images_json=images_json
        )

        # handle tags
        tags_response: List[TagResponse] = []
        for tag_req in request.tags:
            tag: Tag = tag_db.find_tag(db, name=tag_req.name, tag_type=tag_req.tag_type)
            if not tag:
                tag = tag_db.create_tag(db, name=tag_req.name, tag_type=tag_req.tag_type)
            # Check if the entity_tag already exists to avoid duplicates
            entity_tag: EntityTag = entity_tag_db.find_entity_tag(db, entity_id=entity.id, tag_id=tag.id)
            if not entity_tag:
                entity_tag = entity_tag_db.create_entity_tag(db, entity_id=entity.id, tag_id=tag.id)
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
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating entity: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.get("/feed", response_model=EntityFeedResponse)
def get_home_feed(
    num_entities: int = 10,
    num_stances_per_entity: int = 15,
    cursor: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_optional)
) -> EntityFeedResponse:
    try:
        logging.info(f"Fetching home feed: num_entities={num_entities}, num_stances_per_entity={num_stances_per_entity}, cursor={cursor}, user_id={current_user_id}")
        # if cursor is provided, parse it into datetime
        cursor_datetime: Optional[datetime] = None
        if cursor:
            try:
                cursor_datetime = datetime.fromisoformat(cursor)
            except ValueError:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid cursor format")
        
        # fetch n+1 entities to check if there are more
        entities: List[Entity] = entity_db.get_entities_paginated(db, limit=num_entities + 1, cursor=cursor_datetime)
        if not entities:
            return EntityFeedResponse(entities=[], next_cursor=None, has_more=False)

        has_more: bool = len(entities) > num_entities
        if has_more:
            entities = entities[:num_entities]

        feed_entities: List[EntityFeedEntity] = []
        for entity in entities:
            # fetch tags
            tags: List[Tag] = entity_tag_db.get_tags_for_entity(db, entity.id)
            feed_tags: List[EntityFeedTag] = [EntityFeedTag(id=t.id, name=t.name, tag_type=t.tag_type) for t in tags]

            # stances
            stances: List[Stance] = stance_db.get_n_stances_by_entity(db, entity.id, num_stances_per_entity)
            feed_stances: List[EntityFeedStance] = []
            for s in stances:
                avg_rating: Optional[float] = rating_db.get_average_rating_for_stance(db, s.id)
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

        # set next_cursor
        next_cursor: Optional[str] = None
        if has_more and entities:
            next_cursor = entities[-1].created_at.isoformat()

        return EntityFeedResponse(entities=feed_entities, next_cursor=next_cursor, has_more=has_more)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching home feed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.get("/{entity_id}", response_model=EntityReadResponse)
def get_entity_endpoint(
    db: Session = Depends(get_db),
    entity: Entity = Depends(validate_entity)
) -> EntityReadResponse:
    try:
        # get tags
        tags: List[Tag] = entity_tag_db.get_tags_for_entity(db, entity.id)

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
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching entity {entity.id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.put("/{entity_id}", response_model=EntityUpdateResponse)
def update_entity_endpoint(
    request: EntityUpdateRequest,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(get_is_admin),
    entity: Entity = Depends(validate_entity)
) -> EntityUpdateResponse:
    try:
        if not is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
        
        # images
        image_urls: List[str] = []
        if request.images:
            for img in request.images:
                img_bytes: bytes = base64.b64decode(img)
                url: str = upload_image_to_storage(img_bytes, "image/jpeg")
                image_urls.append(url)
        images_json: str = json.dumps(image_urls)

        # new tags
        entity_tag_db.delete_entity_tags_for_entity(db, entity.id)
        tags_response: List[TagResponse] = []
        for tag_req in request.tags:
            tag: Tag = tag_db.find_tag(db, name=tag_req.name, tag_type=tag_req.tag_type)
            if not tag:
                tag = tag_db.create_tag(db, name=tag_req.name, tag_type=tag_req.tag_type)
            entity_tag: EntityTag = entity_tag_db.find_entity_tag(db, entity_id=entity.id, tag_id=tag.id)
            if not entity_tag:
                entity_tag = entity_tag_db.create_entity_tag(db, entity_id=entity.id, tag_id=tag.id)
            tags_response.append(TagResponse(id=tag.id, name=tag.name, tag_type=tag.tag_type))

        entity: Entity = entity_db.update_entity(db, entity_id=entity.id, images_json=images_json, description=request.description, start_time=datetime.fromisoformat(request.start_time) if request.start_time else None, end_time=datetime.fromisoformat(request.end_time) if request.end_time else None, title=request.title)
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
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating entity {entity.id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.delete("/{entity_id}", response_model=EntityDeleteResponse)
def delete_entity_endpoint(
    db: Session = Depends(get_db),
    is_admin: bool = Depends(get_is_admin),
    entity: Entity = Depends(validate_entity)
) -> EntityDeleteResponse:
    try:
        if not is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
        success: bool = entity_db.delete_entity(db, entity_id=entity.id)
        if not success:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to delete entity")
        return EntityDeleteResponse(success=True)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting entity {entity.id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.get("/", response_model=EntityListResponse)
def get_all_entities_endpoint(
    db: Session = Depends(get_db)
) -> EntityListResponse:
    try:
        entities: List[Entity] = entity_db.get_all_entities(db)
        entity_list: List[EntityReadResponse] = []
        for entity in entities:
            # get tags
            tags: List[Tag] = entity_tag_db.get_tags_for_entity(db, entity.id)
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
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching entities: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")