from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List

class AttackPathBase(BaseModel):
    path_nodes: List[str]
    path_length: int

class AttackPathRead(AttackPathBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class AttackPathSummary(BaseModel):
    project_id: UUID
    attack_paths_found: int

class AttackPathList(BaseModel):
    project_id: UUID
    paths: List[AttackPathRead]
