from pydantic_settings import BaseSettings
from pydantic import ConfigDict, Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "AegisAI"
    
    # Required Environment Variables (will fail if not provided)
    POSTGRES_USER: str = Field(..., env="POSTGRES_USER")
    POSTGRES_PASSWORD: str = Field(..., env="POSTGRES_PASSWORD")
    POSTGRES_DB: str = Field(..., env="POSTGRES_DB")
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    
    REDIS_URL: str = Field(..., env="REDIS_URL")
    
    NEO4J_URI: str = Field(..., env="NEO4J_URI")
    NEO4J_USER: str = Field(..., env="NEO4J_USER")
    NEO4J_PASSWORD: str = Field(..., env="NEO4J_PASSWORD")
    
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    
    # Security Defaults
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]
    ENVIRONMENT: str = "development"

    model_config = ConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
