from typing import Optional, Tuple
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.database import entity as entity_db
from app.database import stance as stance_db
from app.database.models import Entity, Stance

# validate entity existence
def validate_entity(
    entity_id: int,
    db: Session = Depends(get_db)
) -> Entity:
    entity: Optional[Entity] = entity_db.read_entity(db, entity_id)
    if not entity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found")
    return entity

# validate entity and stance existence and relationship
def validate_entity_stance(
    entity_id: int,
    stance_id: int,
    db: Session = Depends(get_db)
) -> Tuple[Entity, Stance]:
    entity: Optional[Entity] = entity_db.read_entity(db, entity_id)
    if not entity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found")
    stance: Optional[Stance] = stance_db.read_stance(db, stance_id)
    if not stance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stance not found")
    if stance.entity_id != entity_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Stance does not belong to the specified entity")
    return entity, stance