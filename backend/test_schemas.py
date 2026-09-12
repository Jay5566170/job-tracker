from app.schemas import UserCreate, UserResponse, Token

# Test valid user creation
try:
    user = UserCreate(email="test@example.com", password="secret123")
    print(f"✅ Valid user: {user.email}")
except Exception as e:
    print(f"❌ Error: {e}")

# Test invalid email
try:
    user = UserCreate(email="not-an-email", password="secret123")
    print(f"❌ Should have failed!")
except Exception as e:
    print(f"✅ Correctly rejected invalid email")

# Test Token schema
token = Token(access_token="abc123", token_type="bearer")
print(f"✅ Token: {token.access_token}")

# Test UserResponse
response = UserResponse(id=1, email="test@example.com", created_at="2026-09-12T10:00:00")
print(f"✅ Response: {response.email}")
