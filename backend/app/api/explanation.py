import time
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.explanation_service import ExplanationService
from app.schemas.explanation import AttackPathExplanation
from app.dependencies.auth_dependency import get_current_user
from app.models.user import User
from collections import defaultdict

router = APIRouter(prefix="/explanation", tags=["explanation"])

# Simple in-memory rate limiting: {user_id: [timestamps]}
# 5 requests per minute per user
RATE_LIMIT = 5
RATE_LIMIT_WINDOW = 60
user_requests = defaultdict(list)

def check_rate_limit(user_id: str):
    now = time.time()
    # Filter out old requests
    user_requests[user_id] = [t for t in user_requests[user_id] if now - t < RATE_LIMIT_WINDOW]
    
    if len(user_requests[user_id]) >= RATE_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded (5 requests per minute). Please wait and try again."
        )
    
    user_requests[user_id].append(now)

@router.get("/{attack_path_id}", response_model=AttackPathExplanation)
def get_attack_path_explanation(
    attack_path_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Apply Rate Limiting
    check_rate_limit(str(current_user.id))
    
    # Ownership check and generation happens in service, but we should verify existance 
    # and owner here or within service.
    # Reusing current pattern of service handling DB lookups.
    result = ExplanationService.generate_explanation(db, attack_path_id)
    if not result:
        raise HTTPException(status_code=404, detail="Attack path not found")
    
    return result
