from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.vulnerability import AnalysisResults, VulnerabilityRead
from app.services.analysis_service import AnalysisService
from app.dependencies.auth_dependency import get_current_user
from app.models.user import User

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.post("/run/{project_id}", status_code=status.HTTP_202_ACCEPTED)
def run_analysis(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # This runs synchronously as per Phase 3 rules (not implemented Celery yet)
    AnalysisService.run_analysis(db, current_user, project_id)
    return {
        "project_id": project_id,
        "status": "analysis_started"
    }

@router.get("/results/{project_id}", response_model=AnalysisResults)
def get_results(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vulnerabilities = AnalysisService.get_results(db, current_user, project_id)
    return {
        "project_id": project_id,
        "vulnerabilities": vulnerabilities
    }
