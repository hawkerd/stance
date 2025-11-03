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
    profile as profile_db,
    user as user_db,
)
from .models import *
from .dependencies import *

router = APIRouter(tags=["stances"], prefix="/stances")

@router.get("/", response_model=StanceListResponse)
def get_stances_endpoint(
    db: Session = Depends(get_db),
) -> StanceListResponse:
    try:
        stances: List[Stance] = stance_db.get_all_stances(db)
        return StanceListResponse(
            stances=[
                StanceReadResponse(
                    id=stance.id,
                    user_id=stance.user_id,
                    entity_id=stance.entity_id,
                    headline=stance.headline,
                    content_json=stance.content_json,
                    average_rating=rating_db.get_average_rating_for_stance(db, stance.id)
                ) for stance in stances
            ]
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error retrieving all stances: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.post("/feed", response_model=StanceFeedResponse)
def get_stance_feed_endpoint(
    request: StanceFeedRequest,
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_optional)
) -> StanceFeedResponse:
    try:
        # get random stances
        stances: List[Stance] = stance_db.get_random_stances(db, request.num_stances)

        # get the initial stance if provided
        if request.initial_stance_id:
            stances = [s for s in stances if str(s.id) != request.initial_stance_id]
            initial_stance: Optional[Stance] = stance_db.read_stance(db, int(request.initial_stance_id))
            if initial_stance:
                stances.insert(0, initial_stance)

        feed_stances: List[StanceFeedStance] = []
        for stance in stances:
            # read user information
            user: Optional[User] = user_db.read_user(db, stance.user_id)
            if not user:
                continue

            profile: Optional[Profile] = profile_db.get_profile_by_user_id(db, user.id)

            stance_user: StanceFeedUser = StanceFeedUser(
                id=user.id,
                username=user.username,
                avatar_url=profile.avatar_url if profile else None #nere
            )

            tags: List[Tag] = entity_tag_db.get_tags_for_entity(db, stance.entity_id)
            stance_tags: List[StanceFeedTag] = [StanceFeedTag(id=t.id, name=t.name, tag_type=t.tag_type) for t in tags]

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
                start_time=str(entity.start_time) if entity.start_time else None,
                end_time=str(entity.end_time) if entity.end_time else None
            )

            average_rating: Optional[float] = rating_db.get_average_rating_for_stance(db, stance.id)
            num_ratings: int = rating_db.get_num_ratings_for_stance(db, stance.id)
            my_rating: Optional[int] = None
            if current_user_id:
                rating: Rating = rating_db.read_rating_by_user_and_stance(db, stance.id, current_user_id)
                my_rating = rating.rating if rating else None

            comment_count: int = stance_db.get_comment_count_by_stance(db, stance.id)
            

            stance_stance: StanceFeedStance = StanceFeedStance(
                id=stance.id,
                user=stance_user,
                entity=stance_entity,
                headline=stance.headline,
                content_json=stance.content_json,
                num_comments=comment_count,
                average_rating=average_rating,
                num_ratings=num_ratings,
                my_rating=my_rating,
                tags=stance_tags,
                created_at=str(stance.created_at)
            )
            feed_stances.append(stance_stance)

        next_cursor: Optional[StanceFeedCursor] = None
        if stances and len(stances) == request.num_stances:
            last_stance = stances[-1]
            next_cursor = StanceFeedCursor(score=last_stance.engagement_score, id=last_stance.id)

        return StanceFeedResponse(stances=feed_stances, next_cursor=next_cursor)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching stance feed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")