from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.database.image import create_image
from app.routers.models.images import ImageCreateRequest, ImageCreateResponse
from app.service.storage import upload_image_to_storage
import logging

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
        fk_count = sum(x is not None for x in [request.stance_id, request.issue_id, request.event_id])
        if fk_count != 1:
            raise HTTPException(
                status_code=400, 
                detail="Exactly one of stance_id, issue_id, or event_id must be provided"
            )
        
        if request.mime_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400, 
                detail=f"File type {request.mime_type} not allowed. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}"
            )
        
        # upload to storage
        public_url = upload_image_to_storage(
            file_content=request.image_content,
            content_type=request.mime_type
        )
        
        # Save metadata to database
        image = create_image(
            db=db,
            stance_id=request.stance_id,
            issue_id=request.issue_id,
            event_id=request.event_id,
            public_url=public_url,
            file_size=len(request.image_content),
            file_type=request.mime_type
        )
        
        return ImageCreateResponse(public_url=public_url)
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating image: {e}")
        raise HTTPException(status_code=500, detail="Failed to create image")