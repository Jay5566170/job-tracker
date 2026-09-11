from app.database import engine, Base, SessionLocal

print("✅ Engine created:", engine)
print("✅ Base class created:", Base)
print("✅ Session factory created:", SessionLocal)

# Test connection
try:
    connection = engine.connect()
    print("✅ Database connection successful!")
    connection.close()
except Exception as e:
    print("❌ Database connection failed:", e)