from app.dependencies import get_current_user, oauth2_scheme
from app.utils.security import create_access_token

# Test 1: Import works
print(f"✅ get_current_user imported: {get_current_user}")

# Test 2: Create a valid token
token = create_access_token({"sub": "user@example.com"})
print(f"✅ Token created: {token[:40]}...")

# Test 3: Verify decode works
from app.utils.security import decode_access_token
payload = decode_access_token(token)
print(f"✅ Payload: {payload}")

# Note: Full test requires a route with authentication