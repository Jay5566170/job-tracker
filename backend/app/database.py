# app/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import DATABASE_URL

# ============ ENGINE ============
engine = create_engine(DATABASE_URL)

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