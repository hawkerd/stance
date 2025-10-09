from sqlalchemy import Column, Integer, String, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database.connect import Base

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    stance_id = Column(Integer, ForeignKey("stances.id", ondelete="CASCADE"), nullable=True)
    entity_id = Column(Integer, ForeignKey("entities.id", ondelete="CASCADE"), nullable=True)
    public_url = Column(Text, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String(100), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "(stance_id IS NOT NULL AND entity_id IS NULL) OR "
            "(stance_id IS NULL AND entity_id IS NOT NULL)",
            name="images_single_reference_check"
        ),
    )

    stance = relationship("Stance", back_populates="images")
    entity = relationship("Entity", back_populates="images")