import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Asset Tracking Intelligence"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:password@localhost:5432/digital_stand_register",
    )

    def model_post_init(self, __context) -> None:
        # Normalize pasted Render/Neon values before SQLAlchemy parses them.
        url = self.DATABASE_URL.strip().strip('"').strip("'")
        if url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://"):]
        self.DATABASE_URL = url
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000")
    GROQ_API_KEY: str | None = os.getenv("GROQ_API_KEY")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        case_sensitive = True


settings = Settings()
