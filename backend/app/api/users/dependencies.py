from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.database import user as user_db
from app.database.models import User

# validate user existence
def validate_user(
    user_id: int,
    db: Session = Depends(get_db)
) -> User:
    user: User | None = user_db.read_user(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user