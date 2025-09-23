from app.database.connect import SessionLocal
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.service.auth import verify_access_token, is_admin_token

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="login"))) -> int:
    user_id = verify_access_token(token)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return user_id

def get_is_admin(token: str = Depends(OAuth2PasswordBearer(tokenUrl="login"))) -> bool:
    return is_admin_token(token)