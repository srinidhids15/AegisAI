from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Any
from app.db.session import get_db
from app.dependencies.auth_dependency import get_current_user
from app.models.user import User
from app.models.project import Project

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("/")
def get_user_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    # Retrieve all projects created by the user, ordered by newest first
    projects = db.query(Project)\
        .filter(Project.created_by == current_user.id)\
        .order_by(desc(Project.created_at))\
        .all()
        
    return [
        {
            "id": str(p.id),
            "name": p.name,
            "source_type": p.source_type,
            "repo_url": p.repo_url,
            "storage_path": p.storage_path,
            "detected_languages": p.detected_languages,
            "detected_frameworks": p.detected_frameworks,
            "created_at": p.created_at.isoformat()
        } for p in projects
    ]
