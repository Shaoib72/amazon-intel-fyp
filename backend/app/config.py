from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "Amazon Intelligence Platform"
    app_version: str = "1.0.0"
    debug: bool = True
    secret_key: str = "change-this"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    database_url: str = ""
    redis_url: str = "redis://localhost:6379/0"

    news_api_key: str = ""
    youtube_api_key: str = ""
    scraper_api_key: str = ""
    brevo_api_key: str = ""
    openweather_api_key: str = ""
    keepa_api_key: str = ""
    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    reddit_user_agent: str = "amazon-intel-fyp:v1.0"
    from_email: str = ""
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"

settings = Settings()