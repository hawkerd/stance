from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user, get_current_user_optional
from app.database.user import read_user, delete_user
from app.database.entity import read_entity
from app.database.stance import get_stances_by_user_paginated, get_comment_count_by_stance
from app.database.entity_tag import get_tags_for_entity
from app.database.rating import read_rating_by_user_and_stance, get_average_rating_for_stance, get_num_ratings_for_stance
from app.database.models import Stance, Entity, Tag, Rating
from app.routers.models import UserReadResponse, UserDeleteResponse, PaginatedStancesByUserResponse, PaginatedStancesByUserRequest, PaginatedStancesByUserStance, StanceFeedEntity, StanceFeedUser, StanceFeedTag
from typing import List, Optional
import logging

router = APIRouter(tags=["users"], prefix="/users")

@router.get("/me", response_model=UserReadResponse)
def get_current_user_endpoint(db: Session = Depends(get_db), current_user: int = Depends(get_current_user)) -> UserReadResponse:
    user = read_user(db, user_id=current_user)
    if not user:
        logging.error(f"User not found: {current_user}")
        raise HTTPException(status_code=404, detail="User not found")
    return UserReadResponse(id=user.id, username=user.username, full_name=user.full_name, email=user.email)

@router.get("/{user_id}", response_model=UserReadResponse)
def get_user_endpoint(user_id: int, db: Session = Depends(get_db)) -> UserReadResponse:
    user = read_user(db, user_id=user_id)
    if not user:
        logging.error(f"User not found: {user_id}")
        raise HTTPException(status_code=404, detail="User not found")
    return UserReadResponse(id=user.id, username=user.username, full_name=user.full_name, email=user.email)

@router.delete("/{user_id}", response_model=UserDeleteResponse)
def delete_user_endpoint(user_id: int, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)) -> UserDeleteResponse:
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user")
    success = delete_user(db, user_id=user_id)
    if not success:
        logging.error(f"Failed to delete user: {user_id}")
        raise HTTPException(status_code=400, detail="Failed to delete user")
    return UserDeleteResponse(success=True)
    

@router.post("/{user_id}/stances", response_model=PaginatedStancesByUserResponse)
def get_stances_by_user_paginated_endpoint(user_id: int, request: PaginatedStancesByUserRequest, db: Session = Depends(get_db), current_user_id: Optional[int] = Depends(get_current_user_optional)) -> PaginatedStancesByUserResponse:
    try:
        stances: List[Stance] = get_stances_by_user_paginated(db, user_id=user_id, limit=request.num_stances, cursor=request.cursor)

        feed_stances = []
        for stance in stances:
            # read entity tags
            tags: List[Tag] = get_tags_for_entity(db, stance.entity_id)
            stance_tags: List[StanceFeedTag] = [StanceFeedTag(id=t.id, name=t.name, tag_type=t.tag_type) for t in tags]

            # read entity information
            entity: Optional[Entity] = read_entity(db, stance.entity_id)
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

            average_rating: Optional[float] = get_average_rating_for_stance(db, stance.id)
            num_ratings: int = get_num_ratings_for_stance(db, stance.id)
            my_rating: Optional[int] = None
            if current_user_id:
                rating: Rating = read_rating_by_user_and_stance(db, stance.id, current_user_id)
                my_rating = rating.rating if rating else None

            comment_count: int = get_comment_count_by_stance(db, stance.id)
            

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
    except Exception as e:
        logging.error(f"Error fetching stance feed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stance feed")