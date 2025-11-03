from typing import Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.database import entity as entity_db
from app.database.models import Entity

# validate entity existence
def validate_entity(
    entity_id: int,
    db: Session = Depends(get_db)
) -> Entity:
    entity: Optional[Entity] = entity_db.read_entity(db, entity_id)
    if not entity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found")
    return entity