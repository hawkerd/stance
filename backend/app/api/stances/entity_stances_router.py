from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import logging

from app.dependencies import *
from app.service.stance import *
from app.database.models import *
from app.database import (
    image as image_db,
    entity as entity_db,
    entity_tag as entity_tag_db,
    stance as stance_db,
    rating as rating_db,
    profile as profile_db,
    user as user_db,
)
from .models import *
from .dependencies import *

router = APIRouter(tags=["stances"], prefix="/entities/{entity_id}/stances")


@router.get("/{stance_id}/my-rating", response_model=ReadStanceRatingResponse)
def get_my_stance_rating_endpoint(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
    entity_stance: tuple[Entity, Stance] = Depends(validate_entity_stance),
) -> ReadStanceRatingResponse:
    try:
        entity, stance = entity_stance

        rating_obj: Rating | None = rating_db.read_rating_by_user_and_stance(
            db, stance.id, user_id
        )
        rating = rating_obj.rating if rating_obj else None
        return ReadStanceRatingResponse(rating=rating)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting user rating for stance {stance.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.post("/", response_model=StanceCreateResponse)
def create_stance_endpoint(
    request: StanceCreateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
    entity: Entity = Depends(validate_entity),
) -> StanceCreateResponse:
    try:
        logging.info(f"Creating stance for user {user_id} with entity_id {entity.id}")

        # check if the user already has a stance for this entity
        existing_stances: list[Stance] = stance_db.get_stances_by_user(db, user_id)
        for stance in existing_stances:
            if stance.entity_id == entity.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User already has a stance for this entity",
                )

        processed_content, image_urls = process_stance_content_json(
            request.content_json
        )

        # create the stance
        stance_obj: Stance = stance_db.create_stance(
            db,
            user_id=user_id,
            entity_id=entity.id,
            headline=request.headline,
            content_json=processed_content,
        )

        for url in image_urls:
            image_db.create_image(
                db,
                stance_id=stance_obj.id,
                entity_id=None,
                public_url=url,
                file_size=0,
                file_type="image/png",
            )

        return StanceCreateResponse(
            id=stance_obj.id,
            user_id=stance_obj.user_id,
            entity_id=stance_obj.entity_id,
            headline=stance_obj.headline,
            content_json=stance_obj.content_json,
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating stance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/me", response_model=PaginatedStancesByEntityStanceResponse | None)
def get_my_stance_for_entity(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
    entity: Entity = Depends(validate_entity),
) -> PaginatedStancesByEntityStanceResponse | None:
    try:
        stance: Stance | None = stance_db.get_user_stance_by_entity(
            db, entity_id=entity.id, user_id=user_id
        )
        if not stance:
            return None

        # read user information
        user: User | None = user_db.read_user(db, stance.user_id)
        if not user:
            return None

        profile: Profile | None = profile_db.get_profile_by_user_id(db, user.id)

        stance_user: StanceFeedUser = StanceFeedUser(
            id=user.id,
            username=user.username,
            avatar_url=profile.avatar_url if profile else None,
        )

        tags: list[Tag] = entity_tag_db.get_tags_for_entity(db, stance.entity_id)
        stance_tags: list[StanceFeedTag] = [
            StanceFeedTag(id=t.id, name=t.name, tag_type=t.tag_type) for t in tags
        ]

        entity: Entity | None = entity_db.read_entity(db, stance.entity_id)
        if not entity:
            return None

        average_rating: float | None = rating_db.get_average_rating_for_stance(
            db, stance.id
        )
        num_ratings: int = rating_db.get_num_ratings_for_stance(db, stance.id)
        my_rating: int | None = None
        rating: Rating | None = rating_db.read_rating_by_user_and_stance(
            db, stance.id, user_id
        )
        my_rating = rating.rating if rating else None

        stance_stance: PaginatedStancesByEntityStance = PaginatedStancesByEntityStance(
            id=stance.id,
            user=stance_user,
            headline=stance.headline,
            content_json=stance.content_json,
            average_rating=average_rating,
            num_ratings=num_ratings,
            my_rating=my_rating,
            tags=stance_tags,
            created_at=str(stance.created_at) if stance.created_at else None,
        )

        return PaginatedStancesByEntityStanceResponse(stance=stance_stance)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching user's stance for entity {entity.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/{stance_id}", response_model=StanceReadResponse)
def get_stance_basic_endpoint(
    db: Session = Depends(get_db),
    entity_stance: tuple[Entity, Stance] = Depends(validate_entity_stance),
) -> StanceReadResponse:
    try:
        entity, stance = entity_stance

        avg_rating: float | None = rating_db.get_average_rating_for_stance(
            db, stance.id
        )
        return StanceReadResponse(
            id=stance.id,
            user_id=stance.user_id,
            entity_id=stance.entity_id,
            headline=stance.headline,
            content_json=stance.content_json,
            average_rating=avg_rating,
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error retrieving stance {stance.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/{stance_id}/page", response_model=StanceFeedStanceResponse)
def get_stance_endpoint(
    db: Session = Depends(get_db),
    current_user_id: int | None = Depends(get_current_user_optional),
    entity_stance: tuple[Entity, Stance] = Depends(validate_entity_stance),
) -> StanceFeedStanceResponse:
    try:
        entity, stance = entity_stance

        # read user information
        user: User | None = user_db.read_user(db, stance.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        profile: Profile | None = profile_db.get_profile_by_user_id(db, user.id)
        stance_user: StanceFeedUser = StanceFeedUser(
            id=user.id,
            username=user.username,
            avatar_url=profile.avatar_url if profile else None,
        )

        tags: list[Tag] = entity_tag_db.get_tags_for_entity(db, stance.entity_id)
        stance_tags: list[StanceFeedTag] = [
            StanceFeedTag(id=t.id, name=t.name, tag_type=t.tag_type) for t in tags
        ]

        entity: Entity | None = entity_db.read_entity(db, stance.entity_id)
        if not entity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found"
            )

        stance_entity: StanceFeedEntity = StanceFeedEntity(
            id=entity.id,
            type=entity.type,
            title=entity.title,
            images_json=entity.images_json,
            tags=stance_tags,
            description=entity.description,
            start_time=str(entity.start_time) if entity.start_time else None,
            end_time=str(entity.end_time) if entity.end_time else None,
        )

        average_rating: float | None = rating_db.get_average_rating_for_stance(
            db, stance.id
        )
        num_ratings: int = rating_db.get_num_ratings_for_stance(db, stance.id)
        my_rating: int | None = None
        if current_user_id:
            rating: Rating | None = rating_db.read_rating_by_user_and_stance(
                db, stance.id, current_user_id
            )
            my_rating = rating.rating if rating else None

        stance_stance: StanceFeedStance = StanceFeedStance(
            id=stance.id,
            user=stance_user,
            entity=stance_entity,
            headline=stance.headline,
            content_json=stance.content_json,
            average_rating=average_rating,
            num_ratings=num_ratings,
            my_rating=my_rating,
            tags=stance_tags,
            created_at=str(stance.created_at),
        )
        return StanceFeedStanceResponse(stance=stance_stance)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error retrieving stance {stance.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.put("/{stance_id}", response_model=StanceUpdateResponse)
def update_stance_endpoint(
    request: StanceUpdateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
    entity_stance: tuple[Entity, Stance] = Depends(validate_entity_stance),
) -> StanceUpdateResponse:
    try:
        entity, stance = entity_stance
        logging.info(f"Updating stance {stance.id} for user {user_id}")

        processed_content, image_urls = process_stance_content_json(
            request.content_json
        )
        # update the stance
        stance_obj: Stance = stance_db.update_stance(
            db,
            stance_id=stance.id,
            headline=request.headline,
            content_json=processed_content,
        )
        if not stance_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stance not found or not authorized",
            )

        for url in image_urls:
            image_db.create_image(
                db,
                stance_id=stance_obj.id,
                entity_id=None,
                public_url=url,
                file_size=0,
                file_type="image/png",
            )

        avg_rating: float = rating_db.get_average_rating_for_stance(db, stance_obj.id)
        return StanceUpdateResponse(
            id=stance_obj.id,
            user_id=stance_obj.user_id,
            entity_id=stance_obj.entity_id,
            headline=stance_obj.headline,
            content_json=stance_obj.content_json,
            average_rating=avg_rating,
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating stance {stance.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.delete("/{stance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stance_endpoint(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
    entity_stance: tuple[Entity, Stance] = Depends(validate_entity_stance),
) -> None:
    try:
        entity, stance = entity_stance
        logging.info(f"Deleting stance {stance.id} for user {user_id}")

        success: bool = stance_db.delete_stance(db, stance.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to delete stance",
            )

        return
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting stance {stance.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.post("/{stance_id}/rate", response_model=StanceRateResponse)
def rate_stance_endpoint(
    request: StanceRateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
    entity_stance: tuple[Entity, Stance] = Depends(validate_entity_stance),
) -> StanceRateResponse:
    try:
        entity, stance = entity_stance
        # rating can be None (to remove rating) or int
        success: bool = rating_db.rate_stance(
            db, user_id=user_id, stance_id=stance.id, rating=request.rating
        )
        return StanceRateResponse(success=success)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error rating stance {stance.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/{stance_id}/num-ratings", response_model=NumRatingsResponse)
def get_num_ratings_endpoint(
    db: Session = Depends(get_db),
    entity_stance: tuple[Entity, Stance] = Depends(validate_entity_stance),
) -> NumRatingsResponse:
    try:
        entity, stance = entity_stance
        num_ratings: int = rating_db.get_num_ratings_for_stance(db, stance.id)
        return NumRatingsResponse(num_ratings=num_ratings)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting num ratings for stance {stance.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/", response_model=EntityStancesResponse)
def get_entity_stances_endpoint(
    cursor_score: float | None = None,
    cursor_id: int | None = None,
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
    current_user_id: int | None = Depends(get_current_user_optional),
    entity: Entity = Depends(validate_entity),
) -> EntityStancesResponse:
    try:
        # get random stances
        stances: list[Stance] = stance_db.get_entity_stances(
            db,
            entity_ids=[entity.id],
            cursor_score=cursor_score,
            cursor_id=cursor_id,
            limit=limit,
        )

        next_cursor: PaginatedStancesByEntityCursor | None = None
        if stances and len(stances) > limit:
            stances = stances[
                :-1
            ]  # remove the extra stance used to check for next cursor
            last_stance = stances[-1]
            next_cursor = PaginatedStancesByEntityCursor(
                score=last_stance.engagement_score, id=last_stance.id
            )

        feed_stances: list[PaginatedStancesByEntityStance] = []
        for stance in stances:
            # read user information
            user: User | None = user_db.read_user(db, stance.user_id)
            if not user:
                continue

            profile: Profile | None = profile_db.get_profile_by_user_id(db, user.id)

            stance_user: StanceFeedUser = StanceFeedUser(
                id=user.id,
                username=user.username,
                avatar_url=profile.avatar_url if profile else None,
            )

            tags: list[Tag] = entity_tag_db.get_tags_for_entity(db, stance.entity_id)
            stance_tags: list[StanceFeedTag] = [
                StanceFeedTag(id=t.id, name=t.name, tag_type=t.tag_type) for t in tags
            ]

            average_rating: float | None = rating_db.get_average_rating_for_stance(
                db, stance.id
            )
            num_ratings: int = rating_db.get_num_ratings_for_stance(db, stance.id)
            my_rating: int | None = None
            if current_user_id:
                rating: Rating | None = rating_db.read_rating_by_user_and_stance(
                    db, stance.id, current_user_id
                )
                my_rating = rating.rating if rating else None

            stance_stance: PaginatedStancesByEntityStance = (
                PaginatedStancesByEntityStance(
                    id=stance.id,
                    user=stance_user,
                    headline=stance.headline,
                    content_json=stance.content_json,
                    average_rating=average_rating,
                    num_ratings=num_ratings,
                    my_rating=my_rating,
                    tags=stance_tags,
                    created_at=str(stance.created_at) if stance.created_at else None,
                )
            )
            feed_stances.append(stance_stance)

        return EntityStancesResponse(stances=feed_stances, next_cursor=next_cursor)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching stance feed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
