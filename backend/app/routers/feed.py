from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user_optional
from app.database.entity import get_random_entities
from app.database.models import Entity, Stance, Tag
from app.database.entity_tag import get_tags_for_entity
from app.database.stance import get_n_stances_by_entity
from app.routers.models import HomeFeedRequest, HomeFeedResponse, HomeFeedEntity, HomeFeedStance, HomeFeedTag
from typing import List, Optional
import logging

router = APIRouter(prefix="/home", tags=["home"])


@router.post("/feed", response_model=HomeFeedResponse)
def get_home_feed(
    request: HomeFeedRequest,
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_optional)
) -> HomeFeedResponse:
    try:
        logging.info(f"Fetching home feed for user {current_user_id} with request: {request}")

        # Fetch random entities
        entities: List[Entity] = get_random_entities(db, n=request.num_entities)
        if not entities:
            return []

        feed_entities: List[HomeFeedEntity] = []
        for entity in entities:
            # fetch tags
            tags: List[Tag] = get_tags_for_entity(db, entity.id)
            feed_tags: List[HomeFeedTag] = [HomeFeedTag(id=t.id, name=t.name, tag_type=t.tag_type) for t in tags]

            # stances
            stances: List[Stance] = get_n_stances_by_entity(db, entity.id, request.num_stances_per_entity)
            feed_stances: List[HomeFeedStance] = [HomeFeedStance(id=s.id, headline=s.headline) for s in stances]

            feed_entity = HomeFeedEntity(
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

        return HomeFeedResponse(entities=feed_entities)

    except Exception as e:
        logging.error(f"Error fetching home feed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch home feed")