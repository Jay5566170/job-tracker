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

def match_resume_to_job(resume_skills: str, job_description: str) -> dict:
    """Use AI to match a resume to a job description."""
    
    if not resume_skills or not job_description:
        return {
            "match_score": 0,
            "matching_skills": [],
            "missing_skills": [],
            "recommendation": "Not enough data to match."
        }
    
    if model is None:
        return {
            "match_score": 0,
            "matching_skills": [],
            "missing_skills": [],
            "recommendation": "AI not configured."
        }
    
    prompt = f"""
    Compare this resume to this job description. Return ONLY a JSON response:
    {{
        "match_score": 0-100,
        "matching_skills": ["skill1", "skill2"],
        "missing_skills": ["skill3", "skill4"],
        "recommendation": "A brief 1-2 sentence recommendation"
    }}
    
    Resume Skills:
    {resume_skills}
    
    Job Description:
    {job_description[:2000]}
    """
    
    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Clean markdown
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
        print(f"AI matching error: {e}")
        return {
            "match_score": 0,
            "matching_skills": [],
            "missing_skills": [],
            "recommendation": f"Error: {str(e)}"
        }