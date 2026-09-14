import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"Key: {api_key[:20]}..." if api_key else "No key found")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('models/gemini-3.6-flash')
    response = model.generate_content("Say hello")
    print(f"✅ Success: {response.text[:50]}")
except Exception as e:
    print(f"❌ Error: {e}")