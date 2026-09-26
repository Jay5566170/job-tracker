import json
import logging

from fastapi import HTTPException, status

from app.config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)
client = None
client_setup_error = None

try:
    from google import genai

    if GEMINI_API_KEY:
        client = genai.Client(api_key=GEMINI_API_KEY)
except Exception:
    logger.exception("Unable to initialize the Gemini client.")
    client_setup_error = "Gemini client initialization failed."


def _parse_json(response_text: str | None) -> dict:
    if not response_text:
        raise ValueError("The AI provider returned an empty response.")
    result_text = response_text.strip()
    if result_text.startswith("```"):
        result_text = result_text.split("\n", 1)[-1]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        result_text = result_text.removeprefix("json").strip()
    result = json.loads(result_text)
    if not isinstance(result, dict):
        raise ValueError("The AI provider response was not a JSON object.")
    return result


def _generate_json(prompt: str) -> dict:
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI matching and parsing are unavailable because GEMINI_API_KEY is not configured.",
        )
    if client is None:
        logger.error("Gemini client is unavailable: %s", client_setup_error or "unknown setup error")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI service is not configured correctly. Check the backend Gemini SDK and credentials.",
        )

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )
        return _parse_json(response.text)
    except HTTPException:
        raise
    except Exception as error:
        provider_code = getattr(error, "code", None) or getattr(error, "status_code", None)
        error_text = str(error).lower()
        if provider_code in (401, 403) or "401" in error_text or "403" in error_text or "api key" in error_text:
            logger.warning("Gemini rejected the configured credentials (status %s).", provider_code)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="The AI provider rejected its credentials. Verify GEMINI_API_KEY and its API permissions.",
            ) from error
        logger.exception("Gemini request or response parsing failed.")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI provider could not complete the request. Please try again shortly.",
        ) from error


def extract_resume_data(text: str) -> dict:
    """Extract structured resume details without disguising provider failures."""
    if not text or len(text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Not enough readable text was found in the resume to extract skills.",
        )

    prompt = f"""
Analyze this resume and return ONLY a JSON object with:
{{
    "skills": ["skill1", "skill2"],
    "summary": "A brief professional summary"
}}

Resume:
{text[:8000]}
"""
    data = _generate_json(prompt)
    skills = data.get("skills")
    if not isinstance(skills, list) or not all(isinstance(skill, str) for skill in skills):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI provider returned invalid resume skills. Please retry the extraction.",
        )
    return {"skills": skills, "summary": data.get("summary")}


def match_resume_to_job(resume_skills: str, job_description: str) -> dict:
    """Compare owned resume skills with job details using Gemini."""
    if not resume_skills or resume_skills == "[]" or not job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A resume with extracted skills and a job description are required for AI matching.",
        )

    prompt = f"""
Compare this resume with the job details and return ONLY a JSON object:
{{
    "match_score": 0,
    "matching_skills": ["skill1"],
    "missing_skills": ["skill2"],
    "recommendation": "A brief recommendation"
}}

Resume Skills:
{resume_skills[:4000]}

Job Details:
{job_description[:5000]}
"""
    data = _generate_json(prompt)
    try:
        score = int(data["match_score"])
        matching_skills = data["matching_skills"]
        missing_skills = data["missing_skills"]
        recommendation = data["recommendation"]
        if not 0 <= score <= 100:
            raise ValueError("Match score must be between 0 and 100.")
        if (
            not isinstance(matching_skills, list)
            or not all(isinstance(item, str) for item in matching_skills)
            or not isinstance(missing_skills, list)
            or not all(isinstance(item, str) for item in missing_skills)
            or not isinstance(recommendation, str)
        ):
            raise ValueError("Invalid AI match response fields.")
    except (KeyError, TypeError, ValueError) as error:
        logger.warning("Gemini returned an invalid match response: %s", error)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI provider returned an invalid match result. Please retry.",
        ) from error
    return {
        "match_score": score,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "recommendation": recommendation,
    }


def parse_job_description(text: str) -> dict:
    """Extract the job fields used by the add-job form from pasted text."""
    if not text or len(text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Paste at least 50 characters of job posting text to parse it.",
        )

    prompt = f"""
Extract job information from the posting. Return ONLY a JSON object:
{{
    "company": "Company name or null if not present",
    "role": "Job title or null if not present",
    "location": "Location or null if not present",
    "description": "The complete relevant job description",
    "skills": ["required or preferred skills"],
    "requirements": ["experience, education, and other requirements"]
}}

Do not invent information. Use null for unknown strings and empty arrays for unknown lists.

Job posting:
{text[:10000]}
"""
    data = _generate_json(prompt)
    for field in ("skills", "requirements"):
        value = data.get(field, [])
        if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="The AI provider returned invalid parsed job fields. Please retry.",
            )
        data[field] = value
    for field in ("company", "role", "location", "description"):
        value = data.get(field)
        data[field] = value.strip() if isinstance(value, str) and value.strip() else None
    if not data["company"] or not data["role"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not identify both a company and job title. Add them manually or try clearer job text.",
        )
    return data
