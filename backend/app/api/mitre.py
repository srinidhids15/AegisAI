from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.mitre_loader_service import MitreLoaderService
from app.services.mitre_mapping_service import MitreMappingService
from app.dependencies.auth_dependency import get_current_user
from app.models.user import User

router = APIRouter(prefix="/mitre", tags=["mitre"])

@router.post("/load", status_code=status.HTTP_200_OK)
def load_mitre(current_user: User = Depends(get_current_user)):
    # Any authenticated user can load for now per simple requirements
    count = MitreLoaderService.load_dataset()
    return {
        "status": "mitre_loaded",
        "techniques_inserted": count
    }

@router.post("/map/{project_id}", status_code=status.HTTP_200_OK)
def map_vulnerabilities(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = MitreMappingService.map_vulnerabilities(db, project_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return result

@router.get("/summary/{project_id}")
def get_mitre_summary(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    summary = MitreMappingService.get_summary(project_id)
    return summary
