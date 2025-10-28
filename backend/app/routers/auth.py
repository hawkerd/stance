from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_is_admin
from app.service.auth import hash_password, verify_password, create_access_token, generate_refresh_token, refresh_token_expires_at, hash_refresh_token
from app.database.user import get_user_by_username, create_user, get_user_by_email, is_user_admin
from app.database.refresh_token import create_refresh_token, get_refresh_token_by_hash, update_refresh_token
from app.routers.models import (
    SignupRequest, SignupResponse,
    LoginRequest, TokenResponse,
    RefreshRequest, RefreshResponse,
    LogoutRequest, LogoutResponse
)
from app.database.models import User
import logging

router = APIRouter(tags=["auth"])


@router.post("/auth/signup", response_model=SignupResponse)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    if get_user_by_username(db, data.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    if get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already exists")

    password_hash = hash_password(data.password)
    user = create_user(db, data.username, data.full_name, data.email, password_hash, False)
    return SignupResponse(id=user.id, username=user.username, full_name=user.full_name, email=user.email)


@router.post("/auth/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    # get the user and verify the password
    user: User = get_user_by_username(db, data.username)
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # create tokens
    access_token = create_access_token(user.id, user.is_admin)
    refresh_token = generate_refresh_token()

    # add refresh token to DB
    db_token = create_refresh_token(db, user.id, hash_refresh_token(refresh_token), refresh_token_expires_at())

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/auth/refresh", response_model=RefreshResponse)
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
    # verify the refresh token
    db_token = get_refresh_token_by_hash(db, hash_refresh_token(data.refresh_token))
    if not db_token or db_token.revoked:
        raise HTTPException(status_code=401, detail="Invalid or revoked refresh token")
    
    # check whether user is admin
    is_admin = is_user_admin(db, db_token.user_id)

    # create tokens
    access_token = create_access_token(db_token.user_id, is_admin)
    refresh_token = generate_refresh_token()

    update_refresh_token(db, db_token.id, hashed_token=hash_refresh_token(refresh_token), expires_at=refresh_token_expires_at())

    return RefreshResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/auth/logout", response_model=LogoutResponse)
def logout(data: LogoutRequest, db: Session = Depends(get_db)):
    try:
        db_token = get_refresh_token_by_hash(db, hash_refresh_token(data.refresh_token))
        if not db_token or db_token.revoked:
            raise HTTPException(status_code=401, detail="Invalid or revoked refresh token")
        
        update_refresh_token(db, db_token.id, revoked=True)
        return LogoutResponse(success=True)
    except Exception as e:
        logging.error(e)
        return LogoutResponse(success=False)