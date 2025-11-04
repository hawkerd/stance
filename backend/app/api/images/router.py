from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.dependencies import *
from app.database.models import *
from app.database import image as image_db
from .models import *
from app.service.storage import *

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]

router = APIRouter(tags=["images"])

@router.post("/images", response_model=ImageCreateResponse)
async def create_image_endpoint(
    request: ImageCreateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
) -> ImageCreateResponse:
    try:
        # input validation
        fk_count: int = sum(x is not None for x in [request.stance_id, request.entity_id])
        if fk_count != 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Exactly one of stance_id or entity_id must be provided"
            )
        
        if request.mime_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"File type {request.mime_type} not allowed. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}"
            )
        
        # upload to storage
        public_url: str = upload_image_to_storage(
            file_content=request.image_content,
            content_type=request.mime_type
        )
        
        # Save metadata to database
        image: Image = image_db.create_image(
            db=db,
            stance_id=request.stance_id,
            entity_id=request.entity_id,
            public_url=public_url,
            file_size=len(request.image_content),
            file_type=request.mime_type
        )
        
        return ImageCreateResponse(public_url=public_url)
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating image: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")