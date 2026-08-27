"""
main.py — FastAPI backend for the AI CV Matcher & Mock Interview app.

Endpoints:
  POST /upload-cv          Upload a PDF/DOCX file -> parsed CV JSON
  POST /paste-cv           Paste raw CV text -> parsed CV JSON
  POST /scrape-linkedin    Scrape job description directly from a LinkedIn URL
  POST /match              Compare parsed CV vs. job description -> match report
  POST /interview/start    Generate interview questions from CV + job
  POST /interview/answer   Get AI feedback on a single answer
  GET  /health             Health check endpoint
"""

import os
import shutil
import uuid
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai import (
    generate_interview_questions,
    parse_cv,
    score_answer,
    score_match,
)
from parser import extract_text
from scraper import scrape_linkedin_job, search_linkedin_jobs

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AI CV Matcher API",
    description="Match your CV against job descriptions and practice mock interviews.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory for temporary file uploads
TEMP_DIR = os.path.join(os.path.dirname(__file__), "temp_uploads")
os.makedirs(TEMP_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class PasteCVRequest(BaseModel):
    cv_text: str


class ScrapeLinkedInRequest(BaseModel):
    url: str


class SearchJobsRequest(BaseModel):
    skills: list[str]
    job_title: str = ""
    location: str = "Egypt"
    page: int = 0


class MatchRequest(BaseModel):
    cv_json: dict[str, Any]
    job_description: str


class InterviewStartRequest(BaseModel):
    cv_json: dict[str, Any]
    job_description: str


class InterviewAnswerRequest(BaseModel):
    question: str
    answer: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.post("/upload-cv")
async def upload_cv(file: UploadFile = File(...)):
    """
    Upload a PDF or DOCX file.
    Returns the AI-parsed CV as structured JSON.
    """
    filename = file.filename or "upload"
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in ("pdf", "docx"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{ext}'. Please upload a PDF or DOCX file.",
        )

    temp_filename = f"{uuid.uuid4().hex}_{filename}"
    temp_path = os.path.join(TEMP_DIR, temp_filename)

    try:
        with open(temp_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        text = extract_text(temp_path)
        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the file. Please ensure it is not an image-only scan.",
            )

        parsed = parse_cv(text)
        return {"parsed_cv": parsed, "raw_text": text}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CV: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


@app.post("/paste-cv")
async def paste_cv(request: PasteCVRequest):
    """
    Accept raw CV text (pasted by the user).
    Returns the AI-parsed CV as structured JSON.
    """
    if not request.cv_text.strip():
        raise HTTPException(status_code=400, detail="CV text cannot be empty.")

    try:
        parsed = parse_cv(request.cv_text)
        return {"parsed_cv": parsed}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse CV: {str(e)}")


@app.post("/scrape-linkedin")
async def scrape_linkedin(request: ScrapeLinkedInRequest):
    """
    Scrape job title, company, location, and description from a LinkedIn Job URL.
    """
    if not request.url.strip():
        raise HTTPException(status_code=400, detail="LinkedIn URL cannot be empty.")

    try:
        result = await scrape_linkedin_job(request.url)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scrape LinkedIn job: {str(e)}")


@app.post("/search-jobs")
async def search_jobs(request: SearchJobsRequest):
    """
    Search LinkedIn for real job postings matching the candidate's skills and nearby location.
    Supports pagination/page index and keyword shuffling.
    """
    if not request.skills and not request.job_title:
        raise HTTPException(
            status_code=400,
            detail="At least one skill or job title is required to search."
        )

    # Build search query
    keyword_parts = []
    if request.job_title:
        keyword_parts.append(request.job_title)
    
    # Rotate skills based on page index for diversity
    skills = request.skills or []
    if skills:
        start_idx = (request.page * 2) % len(skills)
        selected_skills = skills[start_idx : start_idx + 3] or skills[:3]
        if not request.job_title:
            keyword_parts.extend(selected_skills)
        else:
            keyword_parts.append(selected_skills[0] if selected_skills else "")

    keywords = " ".join([p for p in keyword_parts if p]).strip()
    if not keywords:
        keywords = "Software Engineer"

    location = request.location.strip() if request.location and request.location.strip() else "Egypt"
    start_offset = max(0, request.page) * 10

    try:
        jobs = await search_linkedin_jobs(
            keywords=keywords,
            location=location,
            limit=10,
            start_offset=start_offset
        )

        # Fallback if no jobs found with the compound query
        if not jobs and skills:
            fallback_skill = skills[(request.page) % len(skills)]
            jobs = await search_linkedin_jobs(
                keywords=fallback_skill,
                location=location,
                limit=10,
                start_offset=0
            )

        return {
            "jobs": jobs,
            "query": keywords,
            "location": location,
            "page": request.page,
            "total": len(jobs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search LinkedIn jobs: {str(e)}")


@app.post("/match")
async def match(request: MatchRequest):
    """
    Compare a parsed CV against a job description.
    Returns match percentage, missing keywords, strengths, and suggestions.
    """
    if not request.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    try:
        result = score_match(request.cv_json, request.job_description)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to score match: {str(e)}")


@app.post("/interview/start")
async def start_interview(request: InterviewStartRequest):
    """
    Generate interview questions based on the CV and job description.
    Returns a list of 8 questions.
    """
    if not request.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    try:
        questions = generate_interview_questions(request.cv_json, request.job_description)
        return {"questions": questions}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {str(e)}")


@app.post("/interview/answer")
async def answer_feedback(request: InterviewAnswerRequest):
    """
    Get AI feedback on an interview answer.
    """
    if not request.answer.strip():
        raise HTTPException(status_code=400, detail="Answer cannot be empty.")

    try:
        feedback = score_answer(request.question, request.answer)
        return {"feedback": feedback}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze answer: {str(e)}")


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}
