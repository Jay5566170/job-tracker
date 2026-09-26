# app/config.py

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

# ============ DATABASE ============
DATABASE_URL = os.getenv("DATABASE_URL")

# ============ JWT AUTHENTICATION ============
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ============ AI SERVICES ============
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
    if origin.strip()
]

# ============ APP SETTINGS ============
APP_NAME = "Job Tracker API"
APP_VERSION = "1.0.0"
DEBUG = False


def validate_settings():
    missing = [
        name
        for name, value in (
            ("DATABASE_URL", DATABASE_URL),
            ("SECRET_KEY", SECRET_KEY),
        )
        if not value or not value.strip()
    ]
    if missing:
        raise RuntimeError(
            "Missing required environment variable(s): "
            + ", ".join(missing)
            + ". Configure them before starting the API."
        )