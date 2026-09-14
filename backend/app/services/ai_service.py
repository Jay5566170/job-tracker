# app/services/ai_service.py

import os
import json
from app.config import GEMINI_API_KEY

# Configure Gemini (if using google-generativeai)
try:
    import google.generativeai as genai
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('models/gemini-3.6-flash')
    else:
        model = None
except Exception as e:
    print(f"Gemini setup error: {e}")
    model = None


def extract_resume_data(text: str) -> dict:
    """Use AI to extract structured data from resume text."""
    
    if not text or len(text.strip()) < 50:
        return {"skills": [], "summary": None, "error": "Text too short"}
    
    if model is None:
        # Fallback: simple extraction if AI unavailable
        return {
            "skills": [],
            "summary": text[:200],
            "error": "AI not configured"
        }
    
    prompt = f"""
    Analyze this resume and return ONLY a JSON response:
    {{
        "skills": ["skill1", "skill2", "skill3"],
        "summary": "A brief 2-3 sentence professional summary"
    }}
    
    Resume:
    {text[:3000]}
    """
    
    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Clean markdown if present
        if "```json" in result_text:
            start = result_text.find("```json") + 7
            end = result_text.rfind("```")
            result_text = result_text[start:end].strip()
        elif "```" in result_text:
            start = result_text.find("```") + 3
            end = result_text.rfind("```")
            result_text = result_text[start:end].strip()
        
        data = json.loads(result_text)
        return data
    except Exception as e:
        print(f"AI extraction error: {e}")
        return {
            "skills": [],
            "summary": None,
            "error": str(e)
        }