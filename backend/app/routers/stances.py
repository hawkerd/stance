from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user, get_current_user_optional
from app.service.stance import process_stance_content_json
from app.database.models import User, Entity, Stance, Tag, Rating
from app.database.image import create_image
from app.database.comment import count_comment_nested_replies
from app.database.user import read_user
from app.database.entity import read_entity
from app.database.entity_tag import get_tags_for_entity
from app.database.stance import (
    create_stance, update_stance,
    read_stance, delete_stance,
    get_stances_by_user, get_comments_by_stance,
    get_all_stances, get_stances_by_entity, 
    get_random_stances, get_random_stances_by_entities,
    get_comment_count_by_stance
)
from app.database.rating import (
    get_average_rating_for_stance, rate_stance, 
    read_rating_by_user_and_stance, get_num_ratings_for_stance
)
from app.routers.models import (
    StanceCreateRequest, StanceCreateResponse,
    StanceUpdateRequest, StanceUpdateResponse,
    StanceReadResponse, StanceDeleteResponse,
    StanceListResponse, CommentReadResponse,
    CommentListResponse, StanceRateRequest,
    StanceRateResponse, ReadStanceRatingResponse,
    NumRatingsResponse, StanceFeedRequest,
    StanceFeedResponse, StanceFeedStance,
    StanceFeedTag, StanceFeedUser, StanceFeedEntity
)
from typing import Optional, List
import logging

router = APIRouter(tags=["stances"], prefix="/stances")

@router.get("/{stance_id}/my-rating", response_model=ReadStanceRatingResponse)
def get_my_stance_rating_endpoint(
    stance_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
) -> ReadStanceRatingResponse:
    try:
        rating_obj = read_rating_by_user_and_stance(db, stance_id, user_id)
        rating = rating_obj.rating if rating_obj else None
        return ReadStanceRatingResponse(rating=rating)
    except Exception as e:
        logging.error(f"Error getting user rating for stance {stance_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/", response_model=StanceCreateResponse)
def create_stance_endpoint(
    request: StanceCreateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
) -> StanceCreateResponse:
    try:
        logging.info(f"Creating stance for user {user_id} with entity_id {request.entity_id}")

        # check if the user already has a stance for this entity
        existing_stances = get_stances_by_user(db, user_id)
        for stance in existing_stances:
            if stance.entity_id == request.entity_id:
                logging.warning(f"User {user_id} already has a stance for this entity")
                raise HTTPException(status_code=400, detail="User already has a stance for this entity")

        processed_content, image_urls = process_stance_content_json(request.content_json)

        # create the stance
        stance_obj = create_stance(
            db,
            user_id=user_id,
            entity_id=request.entity_id,
            headline=request.headline,
            content_json=processed_content
        )
        if not stance_obj:
            raise HTTPException(status_code=400, detail="Failed to create stance")
        
        for url in image_urls:
            create_image(db, stance_id=stance_obj.id, entity_id=None, public_url=url, file_size=0, file_type="image/png")

        return StanceCreateResponse(
            id=stance_obj.id,
            user_id=stance_obj.user_id,
            entity_id=stance_obj.entity_id,
            headline=stance_obj.headline,
            content_json=stance_obj.content_json
        )
    except Exception as e:
        logging.error(f"Error creating stance: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{stance_id}", response_model=StanceReadResponse)
def get_stance_endpoint(
    stance_id: int,
    db: Session = Depends(get_db)
) -> StanceReadResponse:
    try:
        stance = read_stance(db, stance_id)
        if not stance:
            raise HTTPException(status_code=404, detail="Stance not found or not authorized")
        avg_rating = get_average_rating_for_stance(db, stance.id)
        return StanceReadResponse(
            id=stance.id,
            user_id=stance.user_id,
            entity_id=stance.entity_id,
            headline=stance.headline,
            content_json=stance.content_json,
            average_rating=avg_rating
        )
    except Exception as e:
        logging.error(f"Error retrieving stance {stance_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/", response_model=StanceListResponse)
def get_stances_endpoint(db: Session = Depends(get_db)) -> StanceListResponse:
    try:
        stances = get_all_stances(db)
        return StanceListResponse(
            stances=[
                StanceReadResponse(
                    id=stance.id,
                    user_id=stance.user_id,
                    entity_id=stance.entity_id,
                    headline=stance.headline,
                    content_json=stance.content_json,
                    average_rating=get_average_rating_for_stance(db, stance.id)
                ) for stance in stances
            ]
        )
    except Exception as e:
        logging.error(f"Error retrieving all stances: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{stance_id}", response_model=StanceUpdateResponse)
def update_stance_endpoint(
    stance_id: int,
    request: StanceUpdateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
) -> StanceUpdateResponse:
    try:
        logging.info(f"Updating stance {stance_id} for user {user_id}")
        # read the current stance
        stance = read_stance(db, stance_id)
        if not stance or stance.user_id != user_id:
            raise HTTPException(status_code=404, detail="Stance not found or not authorized")

        processed_content, image_urls = process_stance_content_json(request.content_json)
        # update the stance
        stance_obj = update_stance(
            db,
            stance_id=stance_id,
            headline=request.headline,
            content_json=processed_content
        )
        if not stance_obj:
            raise HTTPException(status_code=404, detail="Stance not found or not authorized")

        for url in image_urls:
            create_image(db, stance_id=stance_obj.id, entity_id=None, public_url=url, file_size=0, file_type="image/png")
        
        avg_rating = get_average_rating_for_stance(db, stance_obj.id)
        return StanceUpdateResponse(
            id=stance_obj.id,
            user_id=stance_obj.user_id,
            entity_id=stance_obj.entity_id,
            headline=stance_obj.headline,
            content_json=stance_obj.content_json,
            average_rating=avg_rating
        )
    except Exception as e:
        logging.error(f"Error updating stance {stance_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{stance_id}", response_model=StanceDeleteResponse)
def delete_stance_endpoint(
    stance_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
) -> StanceDeleteResponse:
    try:
        logging.info(f"Deleting stance {stance_id} for user {user_id}")
        # read the current stance
        stance = read_stance(db, stance_id)
        if not stance or stance.user_id != user_id:
            raise HTTPException(status_code=404, detail="Stance not found or not authorized")
        
        success = delete_stance(db, stance_id)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to delete stance")

        return StanceDeleteResponse(success=True)
    except Exception as e:
        logging.error(f"Error deleting stance {stance_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/entity/{entity_id}", response_model=StanceListResponse)
def get_stances_by_entity_endpoint(
    entity_id: int,
    db: Session = Depends(get_db)
) -> StanceListResponse:
    try:
        stances = get_stances_by_entity(db, entity_id)
        return StanceListResponse(
            stances=[
                StanceReadResponse(
                    id=stance.id,
                    user_id=stance.user_id,
                    entity_id=stance.entity_id,
                    headline=stance.headline,
                    content_json=stance.content_json,
                    average_rating=get_average_rating_for_stance(db, stance.id)
                ) for stance in stances
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
    
@router.get("/{stance_id}/comments", response_model=CommentListResponse)
def get_comments_by_stance_endpoint(
    stance_id: int,
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_optional)
) -> CommentListResponse:
    try:
        comments = get_comments_by_stance(db, stance_id, False)
        comment_responses = []

        for comment in comments:
            likes = sum(1 for r in comment.reactions if r.is_like)
            dislikes = sum(1 for r in comment.reactions if not r.is_like)

            if current_user_id is None:
                user_reaction = None
            else:
                user_reaction_obj = next((r for r in comment.reactions if r.user_id == current_user_id), None)
                user_reaction = (
                    "like" if user_reaction_obj and user_reaction_obj.is_like else
                    "dislike" if user_reaction_obj and not user_reaction_obj.is_like else
                    None
                )

            comment_responses.append(
                CommentReadResponse(
                    id=comment.id,
                    user_id=comment.user_id,
                    stance_id=comment.stance_id,
                    content=comment.content,
                    parent_id=comment.parent_id,
                    is_active=comment.is_active,
                    likes=likes,
                    dislikes=dislikes,
                    user_reaction=user_reaction,
                    count_nested=count_comment_nested_replies(db, comment.id),
                    created_at=str(comment.created_at),
                    updated_at=str(comment.updated_at) if comment.updated_at else None
                )
            )

        return CommentListResponse(comments=comment_responses)

    except Exception as e:
        logging.error(f"Error getting comments for stance {stance_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{stance_id}/rate", response_model=StanceRateResponse)
def rate_stance_endpoint(
    stance_id: int,
    request: StanceRateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
) -> StanceRateResponse:
    try:
        # rating can be None (to remove rating) or int
        success = rate_stance(db, user_id=user_id, stance_id=stance_id, rating=request.rating)
        return StanceRateResponse(success=success)
    except Exception as e:
        logging.error(f"Error rating stance {stance_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
# Endpoint to get the number of ratings for a stance
@router.get("/{stance_id}/num-ratings", response_model=NumRatingsResponse)
def get_num_ratings_endpoint(
    stance_id: int,
    db: Session = Depends(get_db)
) -> NumRatingsResponse:
    try:
        num_ratings = get_num_ratings_for_stance(db, stance_id)
        return NumRatingsResponse(num_ratings=num_ratings)
    except Exception as e:
        logging.error(f"Error getting num ratings for stance {stance_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
@router.post("/feed", response_model=StanceFeedResponse)
def get_stance_feed_endpoint(
    request: StanceFeedRequest,
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_optional)
) -> StanceFeedResponse:
    try:
        # get random stances
        if request.entities:
            stances = get_random_stances_by_entities(db, request.entities, request.num_stances)
        else:
            stances = get_random_stances(db, request.num_stances)

        # get the initial stance if provided
        if request.initial_stance_id:
            stances = [s for s in stances if str(s.id) != request.initial_stance_id]
            initial_stance = read_stance(db, int(request.initial_stance_id))
            if initial_stance:
                stances.insert(0, initial_stance)

        feed_stances = []
        for stance in stances:
            # read user information
            user: Optional[User] = read_user(db, stance.user_id)
            if not user:
                continue
            stance_user: StanceFeedUser = StanceFeedUser(
                id=user.id,
                username=user.username
            )

            tags: List[Tag] = get_tags_for_entity(db, stance.entity_id)
            stance_tags: List[StanceFeedTag] = [StanceFeedTag(id=t.id, name=t.name, tag_type=t.tag_type) for t in tags]

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
                start_time=str(entity.start_time) if entity.start_time else None,
                end_time=str(entity.end_time) if entity.end_time else None
            )

            average_rating: Optional[float] = get_average_rating_for_stance(db, stance.id)
            num_ratings: int = get_num_ratings_for_stance(db, stance.id)
            my_rating: Optional[int] = None
            if current_user_id:
                rating: Rating = read_rating_by_user_and_stance(db, stance.id, current_user_id)
                my_rating = rating.rating if rating else None

            comment_count: int = get_comment_count_by_stance(db, stance.id)
            

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
                created_at=str(stance.created_at) if stance.created_at else None
            )
            feed_stances.append(stance_stance)
        return StanceFeedResponse(stances=feed_stances)
    except Exception as e:
        logging.error(f"Error fetching stance feed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stance feed")