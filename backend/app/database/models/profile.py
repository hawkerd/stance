from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connect import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    bio = Column(Text)
    avatar_url = Column(Text)
    pinned_stance_id = Column(Integer, ForeignKey("stances.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="profile")
    pinned_stance = relationship("Stance", backref="pinned_by_profiles", foreign_keys=[pinned_stance_id])
    images = relationship("Image", back_populates="profile")