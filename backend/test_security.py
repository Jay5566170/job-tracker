from app.utils.security import hash_password, verify_password, create_access_token, decode_access_token

# Test 1: Hash password
password = "mypassword123"
hashed = hash_password(password)
print(f"✅ Password hashed: {hashed[:30]}...")

# Test 2: Verify password
is_valid = verify_password(password, hashed)
print(f"✅ Password verified: {is_valid}")

# Test 3: Wrong password
is_wrong = verify_password("wrongpassword", hashed)
print(f"✅ Wrong password rejected: {not is_wrong}")

# Test 4: Create token
token = create_access_token({"sub": "user@example.com"})
print(f"✅ Token created: {token[:40]}...")

# Test 5: Decode token
payload = decode_access_token(token)
print(f"✅ Token decoded: {payload}")

# Test 6: Invalid token
invalid = decode_access_token("invalid.token.here")
print(f"✅ Invalid token rejected: {invalid is None}")