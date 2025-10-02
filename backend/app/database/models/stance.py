from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connect import Base

class Stance(Base):
    __tablename__ = "stances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"))
    issue_id = Column(Integer, ForeignKey("issues.id", ondelete="CASCADE"))
    stance = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "(event_id IS NOT NULL AND issue_id IS NULL) OR (event_id IS NULL AND issue_id IS NOT NULL)",
            name="event_or_issue_only"
        ),
    )

    event = relationship("Event", back_populates="stances")
    issue = relationship("Issue", back_populates="stances")
    user = relationship("User", back_populates="stances")
    comments = relationship("Comment", back_populates="stance", cascade="all, delete-orphan")
    blocks = relationship("StanceBlock", back_populates="stance", cascade="all, delete-orphan", order_by="StanceBlock.sort_order")