from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional

class RiskScoreSummary(BaseModel):
    project_id: UUID
    paths_scored: int
    highest_risk: float

class RiskPathRead(BaseModel):
    id: UUID
    risk_score: Optional[float]
    risk_level: Optional[str]
    priority_rank: Optional[int]

    class Config:
        from_attributes = True

class RiskListResponse(BaseModel):
    project_id: UUID
    paths: List[RiskPathRead]
