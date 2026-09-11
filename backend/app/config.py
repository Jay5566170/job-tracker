# app/config.py

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ============ DATABASE ============
DATABASE_URL = os.getenv("DATABASE_URL")

# ============ JWT AUTHENTICATION ============
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ============ AI SERVICES ============
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# ============ APP SETTINGS ============
APP_NAME = "Job Tracker API"
APP_VERSION = "1.0.0"
DEBUG = True