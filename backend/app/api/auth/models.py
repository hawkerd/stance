from pydantic import BaseModel

class SignupRequest(BaseModel):
    username: str
    full_name: str
    email: str
    password: str

class SignupResponse(BaseModel):
    id: int
    username: str
    full_name: str
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

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str