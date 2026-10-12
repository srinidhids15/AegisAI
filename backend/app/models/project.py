import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    source_type = Column(String, nullable=False) # 'git' or 'zip'
    repo_url = Column(String, nullable=True)
    storage_path = Column(String, nullable=False)
    
    detected_languages = Column(JSON, default=[], nullable=False)
    detected_frameworks = Column(JSON, default=[], nullable=False)
    dependency_files = Column(JSON, default=[], nullable=False)
    
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
