from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.database import entity as entity_db
from app.database import stance as stance_db
from app.database import comment as comment_db
from app.database.models import Entity, Stance, Comment


# validate entity and stance existence and relationship
def validate_entity_stance(
    entity_id: int, stance_id: int, db: Session = Depends(get_db)
) -> tuple[Entity, Stance]:
    entity: Entity | None = entity_db.read_entity(db, entity_id)
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found"
        )
    stance: Stance | None = stance_db.read_stance(db, stance_id)
    if not stance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Stance not found"
        )
    if stance.entity_id != entity_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stance does not belong to the specified entity",
        )
    return entity, stance


# validate entity, stance, and comment existence and relationships
def validate_entity_stance_comment(
    entity_id: int, stance_id: int, comment_id: int, db: Session = Depends(get_db)
) -> tuple[Entity, Stance, Comment]:
    entity: Entity | None = entity_db.read_entity(db, entity_id)
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found"
        )
    stance: Stance | None = stance_db.read_stance(db, stance_id)
    if not stance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Stance not found"
        )
    if stance.entity_id != entity_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stance does not belong to the specified entity",
        )
    comment: Comment | None = comment_db.read_comment(db, comment_id=comment_id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
        )
    if comment.stance_id != stance_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comment does not belong to the specified stance",
        )
    return entity, stance, comment
