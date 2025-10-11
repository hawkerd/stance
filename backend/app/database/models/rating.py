from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from app.database.connect import Base

class Rating(Base):
    __tablename__ = "ratings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    stance_id = Column(Integer, ForeignKey("stances.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)

    __table_args__ = (
        UniqueConstraint("stance_id", "user_id", name="unique_stance_user_rating"),
        CheckConstraint('rating >= 1 AND rating <= 5', name='rating_range_1_5'),
    )

    stance = relationship("Stance", back_populates="ratings")
