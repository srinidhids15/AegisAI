from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.ingestion import GitIngestRequest, IngestResponse
from app.services.ingestion_service import IngestionService
from app.dependencies.auth_dependency import get_current_user
from app.models.user import User

router = APIRouter(prefix="/ingestion", tags=["ingestion"])

@router.post("/git", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
def ingest_git(
    request: GitIngestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return IngestionService.ingest_git(
        db, current_user, request.repo_url, request.project_name
    )

@router.post("/zip", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_zip(
    project_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validation of file type could be added here
    return await IngestionService.ingest_zip(
        db, current_user, file, project_name
    )
