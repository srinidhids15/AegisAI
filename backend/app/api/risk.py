from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.risk_engine_service import RiskEngineService
from app.schemas.risk import RiskScoreSummary, RiskListResponse
from app.dependencies.auth_dependency import get_current_user
from app.models.user import User

router = APIRouter(prefix="/risk", tags=["risk"])

@router.post("/calculate/{project_id}", response_model=RiskScoreSummary)
def calculate_risk(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = RiskEngineService.calculate_project_risk(db, project_id)
    if result is None:
        raise HTTPException(status_code=404, detail="No attack paths found for this project")
    
    count, highest = result
    return {
        "project_id": project_id,
        "paths_scored": count,
        "highest_risk": highest
    }

@router.get("/list/{project_id}", response_model=RiskListResponse)
def list_risk_scores(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    paths = RiskEngineService.get_ranked_paths(db, project_id)
    return {
        "project_id": project_id,
        "paths": paths
    }
