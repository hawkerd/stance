from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connect import Base

class EntityTag(Base):
    __tablename__ = "entity_tags"

    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(Integer, ForeignKey("entities.id"), nullable=False, index=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), nullable=False, index=True)

    tag = relationship("Tag", back_populates="entities")
    entity = relationship("Entity", back_populates="tags")
