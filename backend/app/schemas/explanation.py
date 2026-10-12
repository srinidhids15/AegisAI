from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class AttackPathExplanation(BaseModel):
    attack_path_id: UUID
    risk_score: float
    explanation: str
