# app/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import DATABASE_URL, validate_settings

# ============ ENGINE ============
validate_settings()
database_url = DATABASE_URL
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)
engine = create_engine(database_url, pool_pre_ping=True)

# ============ SESSION FACTORY ============
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ============ BASE CLASS ============
Base = declarative_base()

# ============ DEPENDENCY ============
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()