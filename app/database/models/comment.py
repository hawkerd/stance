from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.database.connect import Base

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    stance_id = Column(Integer, ForeignKey("stances.id", ondelete="CASCADE"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"))
    content = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())