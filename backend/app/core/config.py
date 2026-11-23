import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Resolve paths
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BACKEND_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Based Phishing Website Detection API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database Settings
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/phishing_db"
    SQLITE_FALLBACK_URL: str = "sqlite:///./phishing_db.sqlite"
    
    # Security & JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    class Config:
        env_file = str(ENV_PATH) if ENV_PATH.exists() else None
        extra = "allow"

settings = Settings()
