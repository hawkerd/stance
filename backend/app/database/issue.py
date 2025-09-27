from sqlalchemy.orm import Session
from app.database.models.issue import Issue
from typing import Optional, List
from app.errors import DatabaseError
import logging

def create_issue(db: Session, title: str, description: str) -> Issue:
    try:
        issue = Issue(
            title=title,
            description=description
        )
        db.add(issue)
        db.commit()
        db.refresh(issue)
        return issue
    except Exception as e:
        logging.error(f"Error creating issue: {e}")
        raise DatabaseError("Failed to create issue")

def read_issue(db: Session, issue_id: int) -> Optional[Issue]:
    try:
        return db.query(Issue).filter(Issue.id == issue_id).first()
    except Exception as e:
        logging.error(f"Error reading issue {issue_id}: {e}")
        raise DatabaseError("Failed to read issue")

def update_issue(db: Session, issue_id: int, **kwargs) -> Optional[Issue]:
    try:
        issue = db.query(Issue).filter(Issue.id == issue_id).first()
        if not issue:
            return None
        for key, value in kwargs.items():
            if hasattr(issue, key):
                setattr(issue, key, value)
        db.commit()
        db.refresh(issue)
        return issue
    except Exception as e:
        logging.error(f"Error updating issue {issue_id}: {e}")
        raise DatabaseError("Failed to update issue")

def delete_issue(db: Session, issue_id: int) -> bool:
    try:
        issue = db.query(Issue).filter(Issue.id == issue_id).first()
        if issue:
            db.delete(issue)
            db.commit()
            return True
    except Exception as e:
        logging.error(f"Error deleting issue {issue_id}: {e}")
        raise DatabaseError("Failed to delete issue")
    return False

def get_all_issues(db: Session) -> List[Issue]:
    try:
        return db.query(Issue).all()
    except Exception as e:
        logging.error(f"Error getting all issues: {e}")
        raise DatabaseError("Failed to get all issues")
