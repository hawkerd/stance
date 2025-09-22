import bcrypt
import secrets
import hashlib
import jwt
from datetime import datetime, timedelta, timezone
import os
from typing import Optional

REFRESH_TOKEN_EXPIRES_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRES_DAYS"))
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")

# hash and verify passwords
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

# generate, hash, and verify refresh tokens
def generate_refresh_token() -> str:
    return secrets.token_urlsafe(32)

def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def refresh_token_expires_at() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRES_DAYS)

def verify_refresh_token(token: str, hashed: str) -> bool:
    return hash_refresh_token(token) == hashed

# generate/ verify JWT access tokens
def create_access_token(user_id: int) -> str:
    """
    Create a signed JWT access token for a user.
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),    # subject = user ID
        "exp": expire           # expiration timestamp
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

def verify_access_token(token: str) -> Optional[int]:
    """
    Verify a JWT. Returns user_id if valid, None if invalid/expired.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub"))
        return user_id
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None