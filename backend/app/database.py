# app/database.py

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import DATABASE_URL, validate_settings


def normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    if url.startswith("postgresql+psycopg://"):
        return url.replace(
            "postgresql+psycopg://",
            "postgresql+psycopg2://",
            1,
        )
    return url


# ============ ENGINE ============
validate_settings()
database_url = normalize_database_url(DATABASE_URL)
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


def ensure_schema_compatibility():
    """Add nullable columns introduced after the initial create_all schema."""
    additions = {
        "jobs": {
            "location": "VARCHAR(255)",
            "skills": "TEXT",
            "requirements": "TEXT",
        },
        "resumes": {
            "extraction_error": "TEXT",
            "summary": "TEXT",
        },
    }
    inspector = inspect(engine)
    with engine.begin() as connection:
        for table, columns in additions.items():
            if not inspector.has_table(table):
                continue
            existing = {column["name"] for column in inspector.get_columns(table)}
            for column, sql_type in columns.items():
                if column not in existing:
                    connection.execute(
                        text(f'ALTER TABLE "{table}" ADD COLUMN "{column}" {sql_type}')
                    )