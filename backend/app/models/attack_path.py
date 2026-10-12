import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, ForeignKey, JSON, Float, String
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

class AttackPath(Base):
    __tablename__ = "attack_paths"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    
    path_nodes = Column(JSON, nullable=False) # List of node strings e.g. ["Endpoint:/api/login", ...]
    path_length = Column(Integer, nullable=False)
    
    # Risk Scoring Fields
    risk_score = Column(Float, nullable=True)
    risk_level = Column(String, nullable=True) # Critical, High, Medium, Low
    priority_rank = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
