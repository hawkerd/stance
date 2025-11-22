from pydantic import BaseModel


class ImageCreateRequest(BaseModel):
    stance_id: int | None = None
    entity_id: int | None = None
    profile_id: int | None = None
    mime_type: str
    b64_image_content: str


class ImageCreateResponse(BaseModel):
    public_url: str
