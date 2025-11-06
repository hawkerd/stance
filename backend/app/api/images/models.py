from pydantic import BaseModel

class ImageCreateRequest(BaseModel):
    stance_id: int | None = None
    entity_id: int | None = None
    mime_type: str
    image_content: bytes

class ImageCreateResponse(BaseModel):
    public_url: str