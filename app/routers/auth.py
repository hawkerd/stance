from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.service.auth import hash_password, verify_password, create_access_token, generate_refresh_token, refresh_token_expires_at, hash_refresh_token, verify_refresh_token
from app.database.db import get_user_by_username, create_user, create_refresh_token, get_refresh_token_by_hash, update_refresh_token, delete_refresh_token
from app.routers.models.auth import (
    SignupRequest, SignupResponse,
    LoginRequest, TokenResponse,
    RefreshRequest, RefreshResponse,
    LogoutRequest, LogoutResponse
)
import datetime
import logging

router = APIRouter()


@router.post("/signup", response_model=SignupResponse)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    if get_user_by_username(db, data.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    password_hash = hash_password(data.password)
    user = create_user(db, data.username, data.full_name, data.bio, data.email, password_hash)
    return SignupResponse(id=user.id, username=user.username, email=user.email)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    # get the user and verify the password
    user = get_user_by_username(db, data.username)
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # create tokens
    access_token = create_access_token(user.id)
    refresh_token = generate_refresh_token()

    # add refresh token to DB
    db_token = create_refresh_token(db, user.id, hash_refresh_token(refresh_token), refresh_token_expires_at())

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=RefreshResponse)
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
    # verify the refresh token
    db_token = get_refresh_token_by_hash(db, hash_refresh_token(data.refresh_token))
    if not db_token or db_token.revoked:
        raise HTTPException(status_code=401, detail="Invalid or revoked refresh token")
    
    # create tokens
    access_token = create_access_token(db_token.user_id)
    refresh_token = generate_refresh_token()

    update_refresh_token(db, db_token.id, hashed_token=hash_refresh_token(refresh_token), expires_at=refresh_token_expires_at())

    return RefreshResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/logout", response_model=LogoutResponse)
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