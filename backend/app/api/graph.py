from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session as PgSession
from app.db.session import get_db
from app.db.neo4j_session import get_neo4j_session
from app.services.graph_service import GraphService
from app.services.graph_builder_service import GraphBuilderService
from app.dependencies.auth_dependency import get_current_user
from app.models.user import User

router = APIRouter(prefix="/graph", tags=["graph"])

@router.post("/build/{project_id}", status_code=status.HTTP_201_CREATED)
def build_graph(
    project_id: str,
    db: PgSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = GraphBuilderService.build_graph(db, project_id)
    if not success:
        return {"status": "error", "message": "Failed to build graph"}
    
    return {
        "project_id": project_id,
        "status": "graph_created"
    }

@router.get("/summary/{project_id}")
def get_graph_summary(
    project_id: str,
    neo_session = Depends(get_neo4j_session),
    current_user: User = Depends(get_current_user)
):
    # Summary doesn't strictly need ownership check per Objective Part 7,
    # but for security we should probably ensure it.
    # For now, following the specific objective format.
    summary = GraphService.get_summary(neo_session, project_id)
    return {
        "project_id": project_id,
        **summary
    }
