from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connect import Base


class StanceBlock(Base):
    __tablename__ = "stance_blocks"

    id = Column(Integer, primary_key=True, index=True)
    stance_id = Column(Integer, ForeignKey("stances.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=True)
    media_url = Column(Text, nullable=True)
    sort_order = Column(Integer, nullable=False)

    stance = relationship("Stance", back_populates="blocks")
