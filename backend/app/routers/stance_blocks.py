from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.database.stance_block import (
    create_stance_block,
    read_stance_block,
    update_stance_block,
    delete_stance_block,
    get_stance_blocks_by_stance
)
from app.database.stance import read_stance
from app.dependencies import get_current_user

from app.routers.models.stance_blocks import (
    StanceBlockCreateRequest,
    StanceBlockUpdateRequest,
    StanceBlockReadResponse,
    StanceBlockListResponse,
    DeleteStanceBlockResponse
)
import logging

router = APIRouter(tags=["stances"])

@router.post("/stances/{stance_id}/blocks", response_model=StanceBlockReadResponse)
def create_stance_block_endpoint(request: StanceBlockCreateRequest, stance_id: int, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)) -> StanceBlockReadResponse:
    try:
        # read the stance to verify ownership
        stance = read_stance(db, stance_id)
        if not stance or stance.user_id != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to add blocks to this stance")
        
        block = create_stance_block(db, stance_id, request.content, request.media_url, request.sort_order)
        return StanceBlockReadResponse(
            id=block.id,
            stance_id=block.stance_id,
            content=block.content,
            media_url=block.media_url,
            sort_order=block.sort_order
        )
    except Exception as e:
        logging.error(f"Error creating stance block: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/stances/{stance_id}/blocks/{block_id}", response_model=StanceBlockReadResponse)
def read_stance_block_endpoint(stance_id: int, block_id: int, db: Session = Depends(get_db)) -> StanceBlockReadResponse:
    try:
        # read the stance block
        block = read_stance_block(db, block_id)
        if not block or block.stance_id != stance_id:
            raise HTTPException(status_code=404, detail="Stance block not found")
        return StanceBlockReadResponse(
            id=block.id,
            stance_id=block.stance_id,
            content=block.content,
            media_url=block.media_url,
            sort_order=block.sort_order
        )
    except Exception as e:
        logging.error(f"Error reading stance block {block_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/stances/{stance_id}/blocks/{block_id}", response_model=StanceBlockReadResponse)
def update_stance_block_endpoint(stance_id: int, block_id: int, request: StanceBlockUpdateRequest, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)) -> StanceBlockReadResponse:
    try:
        # check if the current user is the owner of the stance
        stance = read_stance(db, stance_id)
        if not stance or stance.user_id != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to update blocks of this stance")

        # read the stance block
        block = read_stance_block(db, block_id)
        if not block or block.stance_id != stance_id:
            raise HTTPException(status_code=404, detail="Stance block not found")
        
        # update the block
        block = update_stance_block(db, block_id, **request.dict(exclude_unset=True))
        if not block or block.stance_id != stance_id:
            raise HTTPException(status_code=404, detail="Stance block not found")
        
        return StanceBlockReadResponse(
            id=block.id,
            stance_id=block.stance_id,
            content=block.content,
            media_url=block.media_url,
            sort_order=block.sort_order
        )
    except Exception as e:
        logging.error(f"Error updating stance block {block_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/stances/{stance_id}/blocks/{block_id}", response_model=DeleteStanceBlockResponse)
def delete_stance_block_endpoint(stance_id: int, block_id: int, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)) -> DeleteStanceBlockResponse:
    try:
        # check if the current user is the owner of the stance
        stance = read_stance(db, stance_id)
        if not stance or stance.user_id != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to delete blocks of this stance")
        
        # read the stance block
        block = read_stance_block(db, block_id)
        if not block or block.stance_id != stance_id:
            raise HTTPException(status_code=404, detail="Stance block not found")

        success = delete_stance_block(db, block_id)
        if not success:
            raise HTTPException(status_code=404, detail="Stance block not found")
        return DeleteStanceBlockResponse(success=True)
    except Exception as e:
        logging.error(f"Error deleting stance block {block_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
@router.get("/stances/{stance_id}/blocks", response_model=StanceBlockListResponse)
def list_stance_blocks_endpoint(stance_id: int, db: Session = Depends(get_db)) -> StanceBlockListResponse:
    try:
        stance = read_stance(db, stance_id)
        if not stance:
            raise HTTPException(status_code=404, detail="Stance not found")

        blocks = get_stance_blocks_by_stance(db, stance_id)
        return StanceBlockListResponse(blocks=[
            StanceBlockReadResponse(
                id=block.id,
                stance_id=block.stance_id,
                content=block.content,
                media_url=block.media_url,
                sort_order=block.sort_order
            ) for block in blocks
        ])
    except Exception as e:
        logging.error(f"Error listing stance blocks for stance {stance_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")