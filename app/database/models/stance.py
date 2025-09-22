from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from app.database.connect import Base

class Stance(Base):
    __tablename__ = "stances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"))
    issue_id = Column(Integer, ForeignKey("issues.id", ondelete="CASCADE"))
    stance = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        CheckConstraint(
            "(event_id IS NOT NULL AND issue_id IS NULL) OR (event_id IS NULL AND issue_id IS NOT NULL)",
            name="event_or_issue_only"
        ),
    )