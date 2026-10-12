import os
import uuid
import zipfile
import shutil
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, status
from app.models.project import Project
from app.models.user import User
from app.services.repo_service import RepoService
from app.services.file_detection_service import FileDetectionService
from app.core.logging import logger

class IngestionService:
    BASE_SANDBOX = "/tmp/aegisai_projects"
    MAX_ZIP_SIZE = 50 * 1024 * 1024 # 50MB

    @staticmethod
    def ingest_git(db: Session, user: User, repo_url: str, project_name: str) -> Project:
        project_id = str(uuid.uuid4())
        
        # Clone repo
        storage_path = RepoService.clone_repo(repo_url, project_id)
        
        # Detect technologies
        langs, frameworks, deps = FileDetectionService.detect(storage_path)
        
        # Create Project in DB
        project = Project(
            id=project_id,
            name=project_name,
            source_type="git",
            repo_url=repo_url,
            storage_path=storage_path,
            detected_languages=langs,
            detected_frameworks=frameworks,
            dependency_files=deps,
            created_by=user.id
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        
        return project

    @staticmethod
    async def ingest_zip(db: Session, user: User, file: UploadFile, project_name: str) -> Project:
        project_id = str(uuid.uuid4())
        target_path = os.path.join(IngestionService.BASE_SANDBOX, project_id)
        
        os.makedirs(IngestionService.BASE_SANDBOX, exist_ok=True)
        os.makedirs(target_path, exist_ok=True)
        
        # Validate ZIP size
        file.file.seek(0, os.SEEK_END)
        size = file.file.tell()
        file.file.seek(0)
        
        if size > IngestionService.MAX_ZIP_SIZE:
            shutil.rmtree(target_path)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="ZIP file too large (max 50MB)"
            )

        # Temporary ZIP storage
        temp_zip = f"{target_path}.zip"
        with open(temp_zip, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        try:
            with zipfile.ZipFile(temp_zip, 'r') as zip_ref:
                # Zip Slip Protection
                for member in zip_ref.namelist():
                    filename = os.path.basename(member)
                    if not filename: continue # skip directories
                    
                    # Check for traversal
                    target_file = os.path.abspath(os.path.join(target_path, member))
                    if not target_file.startswith(os.path.abspath(target_path)):
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Malicious ZIP detected (traversal attempt)"
                        )
                    
                    # Check for symlinks
                    info = zip_ref.getinfo(member)
                    if info.external_attr & 0x20000000: # Symlink bit
                         continue # Just skip symlinks for security

                zip_ref.extractall(target_path)
        except Exception as e:
            logger.error(f"ZIP extraction failed: {str(e)}")
            if os.path.exists(target_path):
                shutil.rmtree(target_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid ZIP file: {str(e)}"
            )
        finally:
            if os.path.exists(temp_zip):
                os.remove(temp_zip)

        # Detect technologies
        langs, frameworks, deps = FileDetectionService.detect(target_path)
        
        # Create Project in DB
        project = Project(
            id=project_id,
            name=project_name,
            source_type="zip",
            storage_path=target_path,
            detected_languages=langs,
            detected_frameworks=frameworks,
            dependency_files=deps,
            created_by=user.id
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        
        return project
