from pydantic import BaseModel
from typing import Optional

class DemographicCreateRequest(BaseModel):
    birth_year: Optional[int]
    gender: Optional[str]
    zip_code: Optional[str]

class DemographicReadResponse(BaseModel):
    user_id: int
    birth_year: Optional[int]
    gender: Optional[str]
    zip_code: Optional[str]

class DemographicUpdateRequest(BaseModel):
    birth_year: Optional[int]
    gender: Optional[str]
    zip_code: Optional[str]

class DemographicUpdateResponse(BaseModel):
    user_id: int
    birth_year: Optional[int]
    gender: Optional[str]
    zip_code: Optional[str]
