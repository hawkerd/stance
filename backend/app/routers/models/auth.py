from pydantic import BaseModel
from typing import Optional

class SignupRequest(BaseModel):
    username: str
    full_name: Optional[str] = None
    email: str
    password: str

class SignupResponse(BaseModel):
    id: int
    username: str
    email: str

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str

class RefreshRequest(BaseModel):
    refresh_token: str

class RefreshResponse(BaseModel):
    access_token: str
    refresh_token: str

class LogoutRequest(BaseModel):
    refresh_token: str

class LogoutResponse(BaseModel):
    success: bool
