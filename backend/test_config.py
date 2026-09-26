from app.config import DATABASE_URL, SECRET_KEY, APP_NAME

print(f"App: {APP_NAME}")
print(f"Database URL configured: {bool(DATABASE_URL)}")
print(f"Secret key loaded: {bool(SECRET_KEY)}")