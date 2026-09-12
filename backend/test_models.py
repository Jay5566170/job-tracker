from app.database import Base, engine
from app.models import User, Job, Resume, Application

# Create tables in database
Base.metadata.create_all(bind=engine)

print("✅ Tables created successfully!")
print("✅ User table:", User.__tablename__)
print("✅ Job table:", Job.__tablename__)
print("✅ Resume table:", Resume.__tablename__)
print("✅ Application table:", Application.__tablename__)