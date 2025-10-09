from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connect import Base

class Stance(Base):
    __tablename__ = "stances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    entity_id = Column(Integer, ForeignKey("entities.id", ondelete="CASCADE"), nullable=False)
    headline = Column(String(200), nullable=False)
    content_json = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    entity = relationship("Entity", back_populates="stances")
    user = relationship("User", back_populates="stances")
    comments = relationship("Comment", back_populates="stance", cascade="all, delete-orphan")
    images = relationship("Image", back_populates="stance", cascade="all, delete-orphan")