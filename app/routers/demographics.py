from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.database.demographic import create_demographic, read_demographic, update_demographic, get_demographic_by_user_id
from app.routers.models.demographics import DemographicCreateRequest, DemographicReadResponse, DemographicUpdateRequest, DemographicUpdateResponse
import logging

router = APIRouter()

@router.post("/demographics", response_model=DemographicReadResponse)
def create_demographic_endpoint(request: DemographicCreateRequest, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)) -> DemographicReadResponse:
    try:
        logging.info(f"Creating demographic for user {user_id} with data {request.model_dump()}")

        # read existing demographic to prevent duplicates
        existing_demographic = get_demographic_by_user_id(db, user_id=user_id)
        if existing_demographic:
            logging.warning(f"User {user_id} already has a demographic")
            raise HTTPException(status_code=400, detail="User already has a demographic")

        demographic = create_demographic(db, user_id=user_id, birth_year=request.birth_year, gender=request.gender, zip_code=request.zip_code)
        if not demographic:
            raise HTTPException(status_code=400, detail="Failed to create demographic")
        return DemographicReadResponse(user_id=demographic.user_id, birth_year=demographic.birth_year, gender=demographic.gender, zip_code=demographic.zip_code)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/demographics", response_model=DemographicReadResponse)
def get_demographic_endpoint(db: Session = Depends(get_db), user_id: int = Depends(get_current_user)) -> DemographicReadResponse:
    try:
        logging.info(f"Fetching demographic for user {user_id}")
        demographic = get_demographic_by_user_id(db, user_id=user_id)
        if not demographic:
            raise HTTPException(status_code=404, detail="Demographic not found")
        return DemographicReadResponse(user_id=demographic.user_id, birth_year=demographic.birth_year, gender=demographic.gender, zip_code=demographic.zip_code)
    except Exception as e:
        logging.error(f"Error fetching demographic for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/demographics", response_model=DemographicUpdateResponse)
def update_demographic_endpoint(request: DemographicUpdateRequest, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)) -> DemographicUpdateResponse:
    try:
        logging.info(f"Updating demographic for user {user_id} with data {request.model_dump()}")
        existing_demographic = get_demographic_by_user_id(db, user_id=user_id)
        if not existing_demographic:
            raise HTTPException(status_code=404, detail="Demographic not found")

        demographic = update_demographic(db, demographic_id=existing_demographic.id, **request.model_dump())
        if not demographic:
            raise HTTPException(status_code=400, detail="Failed to update demographic")
        return DemographicUpdateResponse(user_id=demographic.user_id, birth_year=demographic.birth_year, gender=demographic.gender, zip_code=demographic.zip_code)
    except Exception as e:
        logging.error(f"Error updating demographic for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")