import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("No Gemini API key configured")
    raise SystemExit(0)

try:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents="Say hello",
    )
    print(f"Success: {response.text[:50]}")
except Exception as e:
    print(f"Error: {e}")