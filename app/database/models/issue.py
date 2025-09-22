from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.database.connect import Base

class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())