from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connect import Base
from enum import Enum


class EntityType(Enum):
    EVENT = 1
    ISSUE = 2
    LEGISLATION = 3
    QUOTE = 4


class Entity(Base):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True)
    unique_id = Column(String(50), unique=True, nullable=False, index=True)
    type = Column(Integer, nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(Text, nullable=True)  # event, legislation
    start_time = Column(
        DateTime(timezone=True), nullable=True
    )  # event, legislation, quote
    end_time = Column(DateTime(timezone=True), nullable=True)  # event/legislation
    images_json = Column(Text, nullable=True)  # JSON array of image URLs

    # legislation specific
    latest_action_date = Column(DateTime(timezone=True), nullable=True)
    latest_action_text = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    stances = relationship(
        "Stance", back_populates="entity", cascade="all, delete-orphan"
    )
    images = relationship(
        "Image", back_populates="entity", cascade="all, delete-orphan"
    )
    tags = relationship(
        "EntityTag", back_populates="entity", cascade="all, delete-orphan"
    )
