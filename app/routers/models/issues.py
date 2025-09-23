from pydantic import BaseModel
from typing import Optional

class IssueCreateRequest(BaseModel):
    title: str
    description: Optional[str]

class IssueReadResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]

class IssueUpdateRequest(BaseModel):
    title: Optional[str]
    description: Optional[str]

class IssueUpdateResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]

class IssueDeleteResponse(BaseModel):
    success: bool