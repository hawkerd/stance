from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
import logging

from app.dependencies import *
from app.service.stance import *
from app.database.models import *
from app.database import (
    entity as entity_db,
    entity_tag as entity_tag_db,
    stance as stance_db,
    rating as rating_db,
    user as user_db,
)
from .models import *
from .dependencies import *

router = APIRouter(tags=["stances"], prefix="/users/{user_id}/stances")

@router.post("/feed", response_model=PaginatedStancesByUserResponse)
def get_stances_by_user_paginated_endpoint(
    user_id: int,
    request: PaginatedStancesByUserRequest,
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_optional)
) -> PaginatedStancesByUserResponse:
    try:
        user: Optional[User] = user_db.read_user(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        stances: List[Stance] = stance_db.get_stances_by_user_paginated(db, user_id=user_id, limit=request.num_stances, cursor=request.cursor)

        feed_stances = []
        for stance in stances:
            # read entity tags
            tags: List[Tag] = entity_tag_db.get_tags_for_entity(db, stance.entity_id)
            stance_tags: List[StanceFeedTag] = [StanceFeedTag(id=t.id, name=t.name, tag_type=t.tag_type) for t in tags]

            # read entity information
            entity: Optional[Entity] = entity_db.read_entity(db, stance.entity_id)
            if not entity:
                continue
            stance_entity: StanceFeedEntity = StanceFeedEntity(
                id=entity.id,
                type=entity.type,
                title=entity.title,
                images_json=entity.images_json,
                tags=stance_tags,
                description=entity.description,
                start_time=entity.start_time.isoformat() if entity.start_time else None,
                end_time=entity.end_time.isoformat() if entity.end_time else None
            )

            average_rating: Optional[float] = rating_db.get_average_rating_for_stance(db, stance.id)
            num_ratings: int = rating_db.get_num_ratings_for_stance(db, stance.id)
            my_rating: Optional[int] = None
            if current_user_id:
                rating: Rating = rating_db.read_rating_by_user_and_stance(db, stance.id, current_user_id)
                my_rating = rating.rating if rating else None

            comment_count: int = stance_db.get_comment_count_by_stance(db, stance.id)
            stance_stance: PaginatedStancesByUserStance = PaginatedStancesByUserStance(
                id=stance.id,
                entity=stance_entity,
                headline=stance.headline,
                content_json=stance.content_json,
                num_comments=comment_count,
                average_rating=average_rating,
                num_ratings=num_ratings,
                my_rating=my_rating,
                tags=stance_tags,
                created_at=stance.created_at.isoformat()
            )
            feed_stances.append(stance_stance)

        next_cursor = None
        if len(stances) == request.num_stances:
            next_cursor = stances[-1].created_at.isoformat()

        return PaginatedStancesByUserResponse(stances=feed_stances, next_cursor=next_cursor)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching stance feed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
    