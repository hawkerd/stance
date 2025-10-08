from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_is_admin, get_current_user
from app.database.issue import create_issue, read_issue, update_issue, delete_issue, get_all_issues
from app.database.stance import get_user_stance_by_issue
from app.routers.models.issues import IssueCreateRequest, IssueReadResponse, IssueUpdateRequest, IssueUpdateResponse, IssueDeleteResponse, IssueListResponse
from app.routers.models.stances import StanceReadResponse
import logging
from typing import Optional

router = APIRouter(tags=["issues"])

@router.post("/issues", response_model=IssueReadResponse)
def create_issue_endpoint(request: IssueCreateRequest, db: Session = Depends(get_db), is_admin: bool = Depends(get_is_admin)) -> IssueReadResponse:
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    issue = create_issue(db, title=request.title, description=request.description)
    if not issue:
        raise HTTPException(status_code=400, detail="Failed to create issue")
    return IssueReadResponse(
        id=issue.id,
        title=issue.title,
        description=issue.description,
        created_at=issue.created_at.isoformat(),
        updated_at=issue.updated_at.isoformat()
    )

@router.get("/issues/{issue_id}", response_model=IssueReadResponse)
def get_issue_endpoint(issue_id: int, db: Session = Depends(get_db)) -> IssueReadResponse:
    issue = read_issue(db, issue_id=issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return IssueReadResponse(
        id=issue.id,
        title=issue.title,
        description=issue.description,
        created_at=issue.created_at.isoformat(),
        updated_at=issue.updated_at.isoformat()
    )

@router.put("/issues/{issue_id}", response_model=IssueUpdateResponse)
def update_issue_endpoint(issue_id: int, request: IssueUpdateRequest, db: Session = Depends(get_db), is_admin: bool = Depends(get_is_admin)) -> IssueUpdateResponse:
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    issue = update_issue(db, issue_id=issue_id, **request.dict(exclude_unset=True))
    if not issue:
        raise HTTPException(status_code=400, detail="Failed to update issue")
    return IssueUpdateResponse(
        id=issue.id,
        title=issue.title,
        description=issue.description,
        created_at=issue.created_at.isoformat(),
        updated_at=issue.updated_at.isoformat()
    )

@router.delete("/issues/{issue_id}", response_model=IssueDeleteResponse)
def delete_issue_endpoint(issue_id: int, db: Session = Depends(get_db), is_admin: bool = Depends(get_is_admin)) -> IssueDeleteResponse:
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    success = delete_issue(db, issue_id=issue_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete issue")
    return IssueDeleteResponse(success=True)

@router.get("/issues", response_model=IssueListResponse)
def get_all_issues_endpoint(db: Session = Depends(get_db)):
    issues = get_all_issues(db)
    return IssueListResponse(
        issues=[
            IssueReadResponse(
                id=issue.id,
                title=issue.title,
                description=issue.description,
                created_at=issue.created_at.isoformat(),
                updated_at=issue.updated_at.isoformat()
            ) for issue in issues
        ]
    )

@router.get("/issues/{issue_id}/stances/me", response_model=Optional[StanceReadResponse])
def get_my_stance_for_issue(issue_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)) -> Optional[StanceReadResponse]:
    stance = get_user_stance_by_issue(db, issue_id=issue_id, user_id=user_id)
    if not stance:
        return None
    return StanceReadResponse(
        id=stance.id,
        user_id=stance.user_id,
        event_id=stance.event_id,
        issue_id=stance.issue_id,
        headline=stance.headline,
        content_json=stance.content_json
    )
