from sqlalchemy.orm import Session
from app.database.models import User

# database layer logic - CRUD operations

def create_user(db: Session, username: str, full_name: str, bio: str, email: str, password_hash: str) -> User:
    user = User(
        username=username,
        full_name=full_name,
        bio=bio,
        email=email,
        password_hash=password_hash
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user