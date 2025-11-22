from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import logging
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
    entity_tag as entity_tag_db,
)
from app.service.storage import *
from .models import *
from .dependencies import *

router = APIRouter(tags=["entities"], prefix="/entities")


@router.post("/", response_model=EntityReadResponse)
def create_entity_endpoint(
    request: EntityCreateRequest,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(get_is_admin),
) -> EntityReadResponse:
    try:
        if not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin privileges required",
            )

        # Upload images and get URLs
        image_urls: list[str] = []
        if request.images:
            for img in request.images:
                img_bytes: bytes = base64.b64decode(img)
                url: str = upload_image_to_storage(img_bytes, "image/jpeg")
                image_urls.append(url)
        images_json: str = json.dumps(image_urls)

        # create the entity
        entity: Entity = entity_db.create_entity(
            db,
            unique_id=request.unique_id,
            type=request.type,
            title=request.title,
            description=request.description,
            start_time=(
                datetime.fromisoformat(request.start_time)
                if request.start_time
                else None
            ),
            end_time=(
                datetime.fromisoformat(request.end_time) if request.end_time else None
            ),
            images_json=images_json,
            latest_action_date=(
                datetime.fromisoformat(request.latest_action_date)
                if request.latest_action_date
                else None
            ),
            latest_action_text=request.latest_action_text,
        )

        # handle tags
        tags_response: list[TagResponse] = []
        for tag_req in request.tags:
            tag: Tag = tag_db.find_tag(db, name=tag_req.name, tag_type=tag_req.tag_type)
            if not tag:
                tag = tag_db.create_tag(
                    db, name=tag_req.name, tag_type=tag_req.tag_type
                )
            # Check if the entity_tag already exists to avoid duplicates
            entity_tag: EntityTag = entity_tag_db.find_entity_tag(
                db, entity_id=entity.id, tag_id=tag.id
            )
            if not entity_tag:
                entity_tag = entity_tag_db.create_entity_tag(
                    db, entity_id=entity.id, tag_id=tag.id
                )
            tags_response.append(
                TagResponse(id=tag.id, name=tag.name, tag_type=tag.tag_type)
            )

        return EntityReadResponse(
            id=entity.id,
            unique_id=entity.unique_id,
            type=entity.type,
            title=entity.title,
            description=entity.description,
            start_time=entity.start_time.isoformat() if entity.start_time else None,
            end_time=entity.end_time.isoformat() if entity.end_time else None,
            images_json=entity.images_json,
            tags=tags_response,
            latest_action_date=(
                entity.latest_action_date.isoformat()
                if entity.latest_action_date
                else None
            ),
            latest_action_text=entity.latest_action_text,
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating entity: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/", response_model=EntityListResponse)
def get_entities_endpoint(
    num_stances_per_entity: int = 15,
    cursor: str | None = None,
    limit: int = Query(10, le=100),
    db: Session = Depends(get_db),
) -> EntityListResponse:
    try:
        # if cursor is provided, parse it into datetime
        cursor_datetime: datetime | None = None
        if cursor:
            try:
                cursor_datetime = datetime.fromisoformat(cursor)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid cursor format",
                )

        entities: list[Entity] = entity_db.get_entities(
            db, limit=limit, cursor=cursor_datetime
        )

        next_cursor: str | None = None
        if len(entities) > limit:
            entities = entities[:-1]
            next_cursor = entities[-1].created_at.isoformat()

        feed_entities: list[EntityFeedEntity] = []
        for entity in entities:
            # fetch tags
            tags: list[Tag] = entity_tag_db.get_tags_for_entity(db, entity.id)
            feed_tags: list[EntityFeedTag] = [
                EntityFeedTag(id=t.id, name=t.name, tag_type=t.tag_type) for t in tags
            ]

            # stances
            stances: list[Stance] = stance_db.get_n_stances_by_entity(
                db, entity.id, num_stances_per_entity
            )
            feed_stances: list[EntityFeedStance] = []
            for s in stances:
                avg_rating: float | None = rating_db.get_average_rating_for_stance(
                    db, s.id
                )
                feed_stances.append(
                    EntityFeedStance(
                        id=s.id, headline=s.headline, average_rating=avg_rating
                    )
                )

            feed_entity = EntityFeedEntity(
                id=entity.id,
                type=entity.type,
                title=entity.title,
                images_json=entity.images_json,
                tags=feed_tags,
                stances=feed_stances,
                description=entity.description,
                start_time=entity.start_time.isoformat() if entity.start_time else None,
                end_time=entity.end_time.isoformat() if entity.end_time else None,
                latest_action_date=(
                    entity.latest_action_date.isoformat()
                    if entity.latest_action_date
                    else None
                ),
                latest_action_text=entity.latest_action_text,
            )
            feed_entities.append(feed_entity)

        return EntityListResponse(entities=feed_entities, next_cursor=next_cursor)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching home feed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/{entity_id}", response_model=EntityReadResponse)
def get_entity_endpoint(
    db: Session = Depends(get_db), entity: Entity = Depends(validate_entity)
) -> EntityReadResponse:
    try:
        # get tags
        tags: list[Tag] = entity_tag_db.get_tags_for_entity(db, entity.id)

        return EntityReadResponse(
            id=entity.id,
            unique_id=entity.unique_id,
            type=entity.type,
            title=entity.title,
            images_json=entity.images_json,
            tags=[TagResponse(id=t.id, name=t.name, tag_type=t.tag_type) for t in tags],
            description=entity.description,
            start_time=entity.start_time.isoformat() if entity.start_time else None,
            end_time=entity.end_time.isoformat() if entity.end_time else None,
            latest_action_date=(
                entity.latest_action_date.isoformat()
                if entity.latest_action_date
                else None
            ),
            latest_action_text=entity.latest_action_text,
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching entity {entity.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.put("/{entity_id}", response_model=EntityUpdateResponse)
def update_entity_endpoint(
    request: EntityUpdateRequest,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(get_is_admin),
    entity: Entity = Depends(validate_entity),
) -> EntityUpdateResponse:
    try:
        if not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin privileges required",
            )

        # images
        image_urls: list[str] = []
        if request.images:
            for img in request.images:
                img_bytes: bytes = base64.b64decode(img)
                url: str = upload_image_to_storage(img_bytes, "image/jpeg")
                image_urls.append(url)
        images_json: str = json.dumps(image_urls)

        # new tags
        entity_tag_db.delete_entity_tags_for_entity(db, entity.id)
        tags_response: list[TagResponse] = []
        for tag_req in request.tags:
            tag: Tag = tag_db.find_tag(db, name=tag_req.name, tag_type=tag_req.tag_type)
            if not tag:
                tag = tag_db.create_tag(
                    db, name=tag_req.name, tag_type=tag_req.tag_type
                )
            entity_tag: EntityTag = entity_tag_db.find_entity_tag(
                db, entity_id=entity.id, tag_id=tag.id
            )
            if not entity_tag:
                entity_tag = entity_tag_db.create_entity_tag(
                    db, entity_id=entity.id, tag_id=tag.id
                )
            tags_response.append(
                TagResponse(id=tag.id, name=tag.name, tag_type=tag.tag_type)
            )

        entity: Entity = entity_db.update_entity(
            db,
            entity_id=entity.id,
            unique_id=request.unique_id,
            images_json=images_json,
            description=request.description,
            start_time=(
                datetime.fromisoformat(request.start_time)
                if request.start_time
                else None
            ),
            end_time=(
                datetime.fromisoformat(request.end_time) if request.end_time else None
            ),
            title=request.title,
            latest_action_date=(
                datetime.fromisoformat(request.latest_action_date)
                if request.latest_action_date
                else None
            ),
            latest_action_text=request.latest_action_text,
        )

        return EntityUpdateResponse(
            id=entity.id,
            unique_id=entity.unique_id,
            type=entity.type,
            title=entity.title,
            description=entity.description,
            start_time=entity.start_time.isoformat() if entity.start_time else None,
            end_time=entity.end_time.isoformat() if entity.end_time else None,
            images_json=entity.images_json,
            tags=tags_response,
            latest_action_date=(
                entity.latest_action_date.isoformat()
                if entity.latest_action_date
                else None
            ),
            latest_action_text=entity.latest_action_text,
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating entity {entity.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.delete("/{entity_id}", response_model=EntityDeleteResponse)
def delete_entity_endpoint(
    db: Session = Depends(get_db),
    is_admin: bool = Depends(get_is_admin),
    entity: Entity = Depends(validate_entity),
) -> EntityDeleteResponse:
    try:
        if not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin privileges required",
            )
        success: bool = entity_db.delete_entity(db, entity_id=entity.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to delete entity",
            )
        return EntityDeleteResponse(success=True)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting entity {entity.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
