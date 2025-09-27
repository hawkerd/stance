from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connect import Base

class CommentReaction(Base):
    __tablename__ = "comment_reactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    comment_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=False)
    is_like = Column(Boolean, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "comment_id", name="uix_user_comment"),
    )

    user = relationship("User", back_populates="comment_reactions")
    comment = relationship("Comment", back_populates="reactions")