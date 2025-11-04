from pydantic import BaseModel
from typing import Optional

class ImageCreateRequest(BaseModel):
    stance_id: Optional[int] = None
    entity_id: Optional[int] = None
    mime_type: str
    image_content: bytes

class ImageCreateResponse(BaseModel):
    public_url: str