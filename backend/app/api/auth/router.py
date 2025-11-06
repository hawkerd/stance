from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.dependencies import *
from app.database.models import *
from app.service.auth import *
from app.database import user as user_db, refresh_token as token_db
from .models import *

router = APIRouter(tags=["auth"], prefix="/auth")


@router.post("/signup", response_model=SignupResponse)
def signup(
    data: SignupRequest,
    db: Session = Depends(get_db)
) -> SignupResponse:
    try:
        existing_username_user: User | None = user_db.get_user_by_username(db, data.username)
        existing_email_user: User | None = user_db.get_user_by_email(db, data.email)
        if existing_username_user or existing_email_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username or email already exists")

        password_hash: str = hash_password(data.password)
        user: User = user_db.create_user(db, data.username, data.full_name, data.email, password_hash, False)
        return SignupResponse(id=user.id, username=user.username, full_name=user.full_name, email=user.email)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
) -> TokenResponse:
    try:
        # get the user and verify the password
        user: User = user_db.get_user_by_username(db, data.username)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
        # create tokens
        access_token: str = create_access_token(user.id, user.is_admin)
        refresh_token: str = generate_refresh_token()

        # add refresh token to DB
        db_token: RefreshToken = token_db.create_refresh_token(db, user.id, hash_refresh_token(refresh_token), refresh_token_expires_at())

        return TokenResponse(access_token=access_token, refresh_token=refresh_token)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.post("/refresh", response_model=RefreshResponse)
def refresh_token(
    data: RefreshRequest,
    db: Session = Depends(get_db)
) -> RefreshResponse:
    try:
        # verify the refresh token
        db_token: RefreshToken | None = token_db.get_refresh_token_by_hash(db, hash_refresh_token(data.refresh_token))
        if not db_token or db_token.revoked:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or revoked refresh token")
        
        # check whether user is admin
        is_admin: bool = user_db.is_user_admin(db, db_token.user_id)

        # create tokens
        access_token: str = create_access_token(db_token.user_id, is_admin)
        refresh_token: str = generate_refresh_token()

        db_token: RefreshToken = token_db.update_refresh_token(db, db_token.id, hashed_token=hash_refresh_token(refresh_token), expires_at=refresh_token_expires_at())
        if not db_token:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update refresh token")

        return RefreshResponse(access_token=access_token, refresh_token=refresh_token)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    data: LogoutRequest,
    db: Session = Depends(get_db)
) -> None:
    try:
        db_token: RefreshToken | None = token_db.get_refresh_token_by_hash(db, hash_refresh_token(data.refresh_token))
        if not db_token or db_token.revoked:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or revoked refresh token")
        
        token_db.update_refresh_token(db, db_token.id, revoked=True)
        return
    except HTTPException:
        raise
    except Exception as e:
        logging.error(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")