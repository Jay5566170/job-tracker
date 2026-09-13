from app.database import SessionLocal
from app.services.auth_service import register_user, authenticate_user, create_user_token
from app.schemas import UserCreate
import random
import string

def random_email():
    """Generate a random email to avoid duplicates."""
    rand = ''.join(random.choices(string.ascii_lowercase, k=8))
    return f"test_{rand}@example.com"

# Create a database session
db = SessionLocal()

try:
    # Test 1: Register a user
    email = random_email()
    user_data = UserCreate(email=email, password="testpass123")
    user = register_user(db, user_data)
    print(f"✅ User registered: {user.email} (id={user.id})")
    
    # Test 2: Try to register same email again
    try:
        register_user(db, user_data)
        print("❌ Should have failed!")
    except Exception as e:
        print(f"✅ Duplicate email rejected: {e.detail}")
    
    # Test 3: Authenticate with correct password
    auth_user = authenticate_user(db, email, "testpass123")
    print(f"✅ Authenticated: {auth_user.email}")
    
    # Test 4: Authenticate with wrong password
    try:
        authenticate_user(db, email, "wrongpass")
        print("❌ Should have failed!")
    except Exception as e:
        print(f"✅ Wrong password rejected: {e.detail}")
    
    # Test 5: Create token
    token_data = create_user_token(auth_user)
    print(f"✅ Token created: {token_data['access_token'][:40]}...")
    
finally:
    db.close()