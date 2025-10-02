from sqlalchemy.orm import Session
from app.database.models.stance_block import StanceBlock
from typing import Optional, List
from app.errors import DatabaseError
import logging

def create_stance_block(db: Session, stance_id: int, content: Optional[str], media_url: Optional[str], sort_order: int) -> StanceBlock:
    try:
        block = StanceBlock(
            stance_id=stance_id,
            content=content,
            media_url=media_url,
            sort_order=sort_order
        )
        db.add(block)
        db.commit()
        db.refresh(block)
        return block
    except Exception as e:
        logging.error(f"Error creating stance block: {e}")
        raise DatabaseError("Failed to create stance block")

def read_stance_block(db: Session, block_id: int) -> Optional[StanceBlock]:
    try:
        return db.query(StanceBlock).filter(StanceBlock.id == block_id).first()
    except Exception as e:
        logging.error(f"Error reading stance block {block_id}: {e}")
        raise DatabaseError("Failed to read stance block")

def update_stance_block(db: Session, block_id: int, **kwargs) -> Optional[StanceBlock]:
    try:
        block = db.query(StanceBlock).filter(StanceBlock.id == block_id).first()
        if not block:
            return None
        for key, value in kwargs.items():
            if hasattr(block, key):
                setattr(block, key, value)
        db.commit()
        db.refresh(block)
        return block
    except Exception as e:
        logging.error(f"Error updating stance block {block_id}: {e}")
        raise DatabaseError("Failed to update stance block")

def delete_stance_block(db: Session, block_id: int) -> bool:
    try:
        block = db.query(StanceBlock).filter(StanceBlock.id == block_id).first()
        if block:
            db.delete(block)
            db.commit()
            return True
    except Exception as e:
        logging.error(f"Error deleting stance block {block_id}: {e}")
        raise DatabaseError("Failed to delete stance block")
    return False

def get_stance_blocks_by_stance(db: Session, stance_id: int) -> List[StanceBlock]:
    try:
        return db.query(StanceBlock).filter(StanceBlock.stance_id == stance_id).order_by(StanceBlock.sort_order).all()
    except Exception as e:
        logging.error(f"Error getting stance blocks for stance {stance_id}: {e}")
        raise DatabaseError("Failed to get stance blocks by stance")
    
def delete_blocks_by_stance(db: Session, stance_id: int) -> bool:
    try:
        db.query(StanceBlock).filter(StanceBlock.stance_id == stance_id).delete(synchronize_session=False)
        db.commit()
        return True
    except Exception as e:
        logging.error(f"Error deleting stance blocks for stance {stance_id}: {e}")
        raise DatabaseError("Failed to delete stance blocks by stance")