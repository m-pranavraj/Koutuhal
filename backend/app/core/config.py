from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Koutuhal Pathways API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_SERVER: str
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "koutuhal"
    
    # SQLALCHEMY_DATABASE_URI will be assembled or can be overridden
    SQLALCHEMY_DATABASE_URI: Optional[str] = None
    
    # Storage
    STORAGE_TYPE: str = "local" # options: local, gcs
    LOCAL_STORAGE_PATH: str = ".storage"
    GCS_BUCKET_NAME: Optional[str] = None
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None
    
    # Security
    SECRET_KEY: str # No default!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Google Auth
    GOOGLE_CLIENT_ID: str
    
    # Payments (Razorpay)
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    
    # File Upload Limits
    MAX_UPLOAD_MB: int = 5
    MAX_FILES_PER_DAY: int = 20
    
    # Rate Limiting
    REDIS_URL: Optional[str] = None
    
    # LLM
    # OPENAI_API_KEY / GEMINI_API_KEY can still be used, but we prefer a generic LLM_API_KEY + LLM_BASE_URL
    LLM_API_KEY: Optional[str] = None 
    LLM_BASE_URL: str = "https://api.openai.com/v1" # Default to OpenAI
    LLM_MODEL: str = "gpt-4-turbo-preview" 

    # Career Readiness Integration
    GROQ_API_KEY: Optional[str] = None
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None
    SEARCHAPI_KEY: Optional[str] = None    
    # Provider presets (optional helpers, but user can just set BASE_URL)
    # If LLM_BASE_URL is set to "https://api.perplexity.ai", etc.
    
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173", 
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8080",
        "https://koutuhal-pathways.vercel.app" # Placeholder for production domain
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore" # Ignore extra env vars
    )

    def assemble_db_connection(self):
        if self.SQLALCHEMY_DATABASE_URI:
            return self.SQLALCHEMY_DATABASE_URI
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
settings.SQLALCHEMY_DATABASE_URI = settings.assemble_db_connection()
