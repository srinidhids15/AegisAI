from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.schemas.auth import UserCreate, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.logging import logger

class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_in.email).first()
        if existing_user:
            # Generic error to avoid user enumeration
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed. Please check your details."
            )
        
        # Create new user
        db_user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            role=UserRole.VIEWER, # Default role
            is_active=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        logger.info(f"New user registered: {db_user.email}")
        return db_user

    @staticmethod
    def authenticate_user(db: Session, user_in: UserLogin) -> str:
        db_user = db.query(User).filter(User.email == user_in.email).first()
        if not db_user or not verify_password(user_in.password, db_user.hashed_password):
            # Generic error to avoid user enumeration
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not db_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive"
            )
            
        access_token = create_access_token(
            data={"sub": str(db_user.id), "role": db_user.role.value}
        )
        
        logger.info(f"User logged in: {db_user.email}")
        return access_token
