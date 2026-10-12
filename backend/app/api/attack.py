from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.attack_path_service import AttackPathService
from app.schemas.attack_path import AttackPathSummary, AttackPathList
from app.dependencies.auth_dependency import get_current_user
from app.models.user import User

router = APIRouter(prefix="/attack", tags=["attack"])

@router.post("/run/{project_id}", response_model=AttackPathSummary, status_code=status.HTTP_201_CREATED)
def run_attack_simulation(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Access control handled within service usually, but let's be safe
    # Logic to check ownership could be added here or in service.
    # Reusing the pattern from Analysis/Graph services.
    count = AttackPathService.run_simulation(db, project_id)
    return {
        "project_id": project_id,
        "attack_paths_found": count
    }

@router.get("/list/{project_id}", response_model=AttackPathList)
def list_attack_paths(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    paths = AttackPathService.list_paths(db, project_id)
    return {
        "project_id": project_id,
        "paths": paths
    }
