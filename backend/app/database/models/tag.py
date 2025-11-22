from sqlalchemy import Column, Integer, String, Text, Enum as SqlEnum
from sqlalchemy.orm import relationship
from app.database.connect import Base

from enum import Enum


class TagType(Enum):
    LOCATION = 1
    TOPIC = 2


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    tag_type = Column(Integer, nullable=False, index=True)

    # Relationships (optional, for join table)
    entities = relationship(
        "EntityTag", back_populates="tag", cascade="all, delete-orphan"
    )
