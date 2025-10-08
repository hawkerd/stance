from supabase import create_client, Client
import os
import uuid
import logging
from fastapi import HTTPException

IMAGES_BUCKET = "stance-images"

def get_supabase_client() -> Client:
    """Create and return a Supabase client"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Supabase configuration missing")
    
    return create_client(supabase_url, supabase_key)

def upload_image_to_storage(file_content: bytes, content_type: str) -> str:
    """
    Upload image to Supabase storage and return public URL
    
    Args:
        file_content: The image file content as bytes
        content_type: MIME type of the file
    
    Returns:
        str: Public URL of the uploaded image
    
    Raises:
        HTTPException: If upload fails
    """
    try:
        # Determine file extension from content type
        content_type_to_extension = {
            "image/jpeg": "jpg",
            "image/jpg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
            "image/gif": "gif",
            "image/svg+xml": "svg"
        }
        
        file_extension = content_type_to_extension.get(content_type, "jpg")
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Upload to Supabase Storage
        supabase = get_supabase_client()
        
        storage_response = supabase.storage.from_(IMAGES_BUCKET).upload(
            path=unique_filename,
            file=file_content,
            file_options={"content-type": content_type}
        )
        
        # Check if upload was successful
        if hasattr(storage_response, 'error') and storage_response.error:
            logging.error(f"Supabase upload error: {storage_response.error}")
            raise HTTPException(status_code=500, detail="Failed to upload image")
        
        # Get public URL
        public_url = supabase.storage.from_(IMAGES_BUCKET).get_public_url(unique_filename)
        
        return public_url
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error uploading image to storage: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image")