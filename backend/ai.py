"""
ai.py — AI-powered analysis using Groq (Llama 3.3 70B).

Provides four core functions:
  1. parse_cv()          — Extract structured data from raw CV text.
  2. score_match()       — Compare a parsed CV against a job description.
  3. generate_interview_questions() — Generate role-specific interview questions.
  4. score_answer()      — Give feedback on an interview answer.
"""

import json
import os
import re
from typing import Any

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

MODEL = "openai/gpt-oss-120b"


def get_groq_client() -> Groq:
    """Retrieve and validate the Groq client."""
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key or api_key == "your_free_key_here":
        raise ValueError(
            "GROQ_API_KEY is not set or is using the placeholder. "
            "Please set a valid GROQ_API_KEY in your .env file or environment variables. "
            "Get a free key at https://console.groq.com"
        )
    return Groq(api_key=api_key)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _call(prompt: str, *, temperature: float = 0.3) -> str:
    """Send a single-turn prompt to the LLM and return the text response."""
    client = get_groq_client()
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
    )
    return response.choices[0].message.content or ""


def _extract_json(text: str) -> Any:
    """
    Robustly extract a JSON object or array from an LLM response.
    Strips markdown fences or surrounding prose.
    """
    # Try to find JSON inside ```json ... ``` or ``` ... ``` fences
    fence_match = re.search(r"```(?:json)?\s*\n?([\s\S]*?)\n?```", text)
    if fence_match:
        cleaned = fence_match.group(1).strip()
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass

    # Strip leading/trailing whitespace
    text = text.strip()

    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to find the first { ... } or [ ... ] block
    for start_char, end_char in [("{", "}"), ("[", "]")]:
        start = text.find(start_char)
        end = text.rfind(end_char)
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except json.JSONDecodeError:
                continue

    raise ValueError(f"Could not parse valid JSON from AI response:\n{text[:400]}")


# ---------------------------------------------------------------------------
# Core AI Functions
# ---------------------------------------------------------------------------

def parse_cv(cv_text: str) -> dict:
    """
    Parse raw CV text into a structured JSON object including location detection.

    Returns a dict with keys:
        name, location, summary, skills, work_experience, education, certifications
    """
    prompt = f"""You are an expert resume parser and recruiter. Extract all relevant details from this resume text and return ONLY valid JSON without markdown wrapping.

JSON structure:
{{
  "name": "Full Name",
  "location": "City, Country (e.g., Cairo, Egypt or Riyadh, Saudi Arabia, or empty if not found)",
  "summary": "Brief professional summary",
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "work_experience": [
    {{
      "role": "Job Title",
      "company": "Company Name",
      "duration": "Dates/Duration",
      "achievements": ["Achievement 1", "Achievement 2"]
    }}
  ],
  "education": [
    {{
      "degree": "Degree / Field of Study",
      "institution": "University / School",
      "year": "Graduation Year"
    }}
  ],
  "certifications": ["Certification 1"]
}}

Resume text:
{cv_text}
"""
    raw = _call(prompt)
    data = _extract_json(raw)
    
    # Ensure baseline fields exist
    return {
        "name": data.get("name") or "Candidate",
        "location": data.get("location") or "",
        "summary": data.get("summary") or "",
        "skills": data.get("skills") if isinstance(data.get("skills"), list) else [],
        "work_experience": data.get("work_experience") if isinstance(data.get("work_experience"), list) else [],
        "education": data.get("education") if isinstance(data.get("education"), list) else [],
        "certifications": data.get("certifications") if isinstance(data.get("certifications"), list) else [],
    }


def score_match(cv_json: dict, job_description: str) -> dict:
    """
    Compare a parsed CV against a job description with deep ATS rubric scoring.

    Returns a dict with keys:
        match_percentage, missing_keywords, strengths, suggested_edits, match_summary
    """
    prompt = f"""You are a senior technical recruiter and ATS algorithms specialist. Perform a rigorous, realistic semantic match between the candidate's CV and the job description.

Evaluation Rubric:
1. Core Technical Skills & Tech Stack Alignment (40% weight): Compare candidate's specific technologies against required tech in the job description.
2. Experience Level & Role Responsibilities (30% weight): Compare candidate's seniority, years of experience, and past accomplishments against required duties.
3. Tools, Methodologies, Databases & Ecosystem (15% weight): Docker, CI/CD, Git, Cloud, Agile, SQL/NoSQL.
4. Education, Certifications & Domain Relevance (15% weight).

Calculate a fair, realistic, and honest match percentage (between 0 and 100).
Identify truly missing critical keywords/technologies that appear in the job requirements but are absent in the CV.
Highlight the candidate's biggest strengths and advantages for this role.
Give 3-5 concrete, actionable resume improvement suggestions to optimize their CV specifically for this job posting.

Return ONLY a valid JSON object:
{{
  "match_percentage": 78,
  "match_summary": "Brief 1-2 sentence overall fit assessment",
  "missing_keywords": ["Specific Missing Tool 1", "Specific Missing Skill 2"],
  "strengths": ["Matched Core Skill 1", "Relevant Experience 2"],
  "suggested_edits": [
    "Actionable bullet point suggestion 1 (e.g. explicitly highlight X in recent role)",
    "Actionable bullet point suggestion 2 (e.g. add metrics to Y project)",
    "Actionable bullet point suggestion 3"
  ]
}}

Candidate profile:
{json.dumps(cv_json, indent=2)}

Job description:
{job_description}
"""
    raw = _call(prompt)
    data = _extract_json(raw)

    match_pct = data.get("match_percentage", 70)
    try:
        match_pct = max(0, min(100, int(match_pct)))
    except Exception:
        match_pct = 70

    return {
        "match_percentage": match_pct,
        "match_summary": data.get("match_summary") or "Comprehensive profile evaluation completed.",
        "missing_keywords": data.get("missing_keywords") if isinstance(data.get("missing_keywords"), list) else [],
        "strengths": data.get("strengths") if isinstance(data.get("strengths"), list) else [],
        "suggested_edits": data.get("suggested_edits") if isinstance(data.get("suggested_edits"), list) else [],
    }


def generate_interview_questions(cv_json: dict, job_description: str) -> list[str]:
    """
    Generate 8 interview questions based on the CV and job description.
    """
    prompt = f"""You are an expert technical and behavioral interview coach. Based on the candidate profile and job description below, generate 8 targeted interview questions.

Include:
- Behavioral questions (evaluating situational and leadership skills with STAR method)
- Technical / Role-specific questions tailored to the gaps and strengths

Return ONLY a valid JSON array of strings:
["Question 1", "Question 2", "Question 3", "Question 4", "Question 5", "Question 6", "Question 7", "Question 8"]

Candidate profile:
{json.dumps(cv_json, indent=2)}

Job description:
{job_description}
"""
    raw = _call(prompt)
    questions = _extract_json(raw)
    if isinstance(questions, list):
        return [str(q) for q in questions]
    return [
        "Tell me about yourself and your background relevant to this role.",
        "What is your greatest technical achievement?",
        "Describe a challenging situation you encountered at work and how you handled it.",
        "How do your skills align with the requirements of this job?",
        "Describe a time you had to learn a new technology quickly.",
        "Tell me about a project that didn't go as planned and what you learned.",
        "Where do you see yourself professionally in the next two to three years?",
        "Why are you interested in this specific opportunity?"
    ]


def score_answer(question: str, answer: str) -> str:
    """
    Give constructive feedback on an interview answer.
    """
    prompt = f"""You are an experienced interview coach. Give brief, constructive feedback (3-4 sentences) on this interview answer.

Evaluate:
1. Clarity and structure (e.g. STAR method)
2. Relevance to the question
3. Concrete examples and impact
4. Key takeaway or suggestion for improvement

Question: {question}

Candidate's answer: {answer}
"""
    return _call(prompt, temperature=0.4)
