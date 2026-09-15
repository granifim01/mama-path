from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Mama Path API"
    api_prefix: str = "/api/v1"
    database_url: str = f"sqlite:///{ROOT / 'data' / 'mama_path.db'}"
    secret_key: str = "dev-secret-change-in-production"
    access_token_expire_minutes: int = 60 * 24 * 7
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"


settings = Settings()
