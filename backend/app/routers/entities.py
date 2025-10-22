from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_is_admin, get_current_user, get_current_user_optional
from app.database.entity import create_entity, read_entity, update_entity, delete_entity, get_all_entities, get_entities_paginated
from app.routers.models import (
    EntityCreateRequest, EntityReadResponse, EntityUpdateRequest, EntityUpdateResponse, EntityDeleteResponse, EntityListResponse, TagResponse, EntityFeedResponse, EntityFeedEntity, EntityFeedStance, EntityFeedTag, StanceFeedStanceResponse
)
from app.database.rating import get_average_rating_for_stance, get_num_ratings_for_stance, read_rating_by_user_and_stance
from app.database.stance import get_user_stance_by_entity, get_n_stances_by_entity, get_comment_count_by_stance
from app.database.models import Stance, Entity, Tag, User, Rating
from app.database.user import read_user
from app.routers.models import StanceFeedStance, StanceFeedUser, StanceFeedEntity, StanceFeedTag
from app.service.storage import upload_image_to_storage
import logging
from typing import Optional, List
from datetime import datetime
import json
import base64
from app.database.tag import create_tag, find_tag
from app.database.entity_tag import create_entity_tag, find_entity_tag, delete_entity_tags_for_entity, get_tags_for_entity
import logging

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
        cursor_datetime = None
        if cursor:
            try:
                cursor_datetime = datetime.fromisoformat(cursor)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid cursor format")
        
        # fetch n+1 entities to check if there are more
        entities: List[Entity] = get_entities_paginated(db, limit=num_entities + 1, cursor=cursor_datetime)
        if not entities:
            return EntityFeedResponse(entities=[], next_cursor=None, has_more=False)

        has_more = len(entities) > num_entities
        if has_more:
            entities = entities[:num_entities]

        feed_entities: List[EntityFeedEntity] = []
        for entity in entities:
            # fetch tags
            tags: List[Tag] = get_tags_for_entity(db, entity.id)
            feed_tags: List[EntityFeedTag] = [EntityFeedTag(id=t.id, name=t.name, tag_type=t.tag_type) for t in tags]

            # stances
            stances: List[Stance] = get_n_stances_by_entity(db, entity.id, num_stances_per_entity)
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

        # set next_cursor
        next_cursor = None
        if has_more and entities:
            next_cursor = entities[-1].created_at.isoformat()

        return EntityFeedResponse(entities=feed_entities, next_cursor=next_cursor, has_more=has_more)

    except Exception as e:
        logging.error(f"Error fetching home feed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch home feed")

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


@router.get("/{entity_id}/stances/me", response_model=Optional[StanceFeedStanceResponse])
def get_my_stance_for_event(entity_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)) -> Optional[StanceFeedStanceResponse]:
    stance: Optional[Stance] = get_user_stance_by_entity(db, entity_id=entity_id, user_id=user_id)
    if not stance:
        return None
    
    # read user information
    user: Optional[User] = read_user(db, stance.user_id)
    if not user:
        return None
    stance_user: StanceFeedUser = StanceFeedUser(
        id=user.id,
        username=user.username
    )

    tags: List[Tag] = get_tags_for_entity(db, stance.entity_id)
    stance_tags: List[StanceFeedTag] = [StanceFeedTag(id=t.id, name=t.name, tag_type=t.tag_type) for t in tags]

    entity: Optional[Entity] = read_entity(db, stance.entity_id)
    if not entity:
        return None
    stance_entity: StanceFeedEntity = StanceFeedEntity(
        id=entity.id,
        type=entity.type,
        title=entity.title,
        images_json=entity.images_json,
        tags=stance_tags,
        description=entity.description,
        start_time=str(entity.start_time) if entity.start_time else None,
        end_time=str(entity.end_time) if entity.end_time else None
    )

    average_rating: Optional[float] = get_average_rating_for_stance(db, stance.id)
    num_ratings: int = get_num_ratings_for_stance(db, stance.id)
    my_rating: Optional[int] = None
    rating: Rating = read_rating_by_user_and_stance(db, stance.id, user_id)
    my_rating = rating.rating if rating else None

    comment_count: int = get_comment_count_by_stance(db, stance.id)

    stance_stance: StanceFeedStance = StanceFeedStance(
        id=stance.id,
        user=stance_user,
        entity=stance_entity,
        headline=stance.headline,
        content_json=stance.content_json,
        average_rating=average_rating,
        num_ratings=num_ratings,
        my_rating=my_rating,
        num_comments=comment_count,
        tags=stance_tags,
        created_at=str(stance.created_at) if stance.created_at else None
    )

    return StanceFeedStanceResponse(stance=stance_stance)