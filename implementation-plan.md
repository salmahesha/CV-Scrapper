# Implementation Plan: AI CV Matcher & Mock Interview App

## 1. Overview

An app that:
1. Takes a user's CV (upload/paste)
2. Matches it against a job description (pasted, or fetched via a legal job-search API)
3. Scores the match, identifies gaps, suggests CV improvements
4. Runs an AI-generated mock interview based on the CV + job

**Note:** LinkedIn cannot be scraped (violates their ToS and has resulted in legal action against scrapers). Job data must come from either manual paste-in or a licensed API.

---

## 2. Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌────────────────────┐
│  Frontend    │ ───▶ │  Backend / API   │ ───▶ │  AI Model (Claude)  │
│  (React)     │ ◀─── │  (Node/Express)  │ ◀─── │  + Job Data API     │
└─────────────┘      └──────────────────┘      └────────────────────┘
```

- **Option A (fastest, zero cost):** Build entirely as a Claude Artifact — no backend needed, AI calls run free through the built-in API, CV parsing done client-side.
- **Option B (standalone deployable app):** React frontend + small Node backend + external AI API + job data API.

---

## 3. Tech Stack

### Frontend
- **React** (or Next.js for routing/SSR)
- **TypeScript** — recommended once CV parsing logic grows
- **Tailwind CSS** — styling
- **react-dropzone** — CV file upload (PDF/DOCX)

### CV Text Extraction
- **pdf-parse** — extract text from PDF
- **mammoth** — extract text from DOCX

### AI / Matching Layer
- **Claude Sonnet 5** — CV parsing, match scoring, gap analysis, interview generation (free via Claude Artifact API access)
- Optional standalone-app alternative: **Groq + Llama 3.3 70B** (free tier, fast, no vendor lock-in)
- Optional embeddings for semantic similarity: **all-MiniLM-L6-v2** (self-hosted, free) or OpenAI `text-embedding-3-small`

### Job Data Source (legal alternatives to LinkedIn scraping)
- **Adzuna API** — free tier, aggregated job listings
- **JSearch (RapidAPI)** — aggregates LinkedIn/Indeed/Glassdoor via licensed data
- **Manual paste-in** — zero-risk fallback, what most commercial tools actually use

### Storage (if persisting data)
- **Browser localStorage / IndexedDB** — for a no-backend version
- **Supabase / Firebase (free tier)** — if a lightweight backend is needed

---

## 4. Core Features & Build Order

### Phase 1 — CV Input & Parsing
- [ ] File upload (PDF/DOCX) or paste-CV-text field
- [ ] Extract raw text (pdf-parse / mammoth)
- [ ] AI call: parse into structured JSON (skills, experience, education, summary)

### Phase 2 — Job Description Input
- [ ] Paste job description field
- [ ] (Optional) Job search via Adzuna/JSearch API, user selects a listing

### Phase 3 — Match Scoring
- [ ] AI call: compare structured CV vs. job description
- [ ] Output: match %, missing keywords/skills, tailored improvement suggestions
- [ ] Display results (score card + gap list)

### Phase 4 — Mock Interview
- [ ] AI call: generate role-specific questions from CV + job description
- [ ] Interactive Q&A loop (user answers, AI gives feedback per answer)
- [ ] Summary/report at the end (strengths, weak areas, suggested improvements)

### Phase 5 — Polish
- [ ] Export match report / interview summary as PDF
- [ ] Save session history (localStorage or Supabase)

---

## 5. Prompt Templates (used internally by the AI calls)

**CV parsing:**
```
Extract the following from this resume as structured JSON:
name, skills, work_experience (role, company, duration, achievements),
education, certifications. Resume text: {cv_text}
```

**Match scoring:**
```
Compare this candidate's resume to the job description below.
Return: match_percentage, missing_keywords, strengths, suggested_edits.
Resume: {cv_json}
Job description: {job_description}
```

**Interview generation:**
```
Based on this resume and job description, generate 8 interview questions
(mix of behavioral and role-specific technical). For each candidate answer,
give brief constructive feedback.
```

---

## 6. Legal/Compliance Notes
- No scraping of LinkedIn or any site that prohibits it in their ToS.
- Use licensed job APIs (Adzuna, JSearch) or manual paste-in only.
- Be transparent with users about where job data comes from.

---

## 7. Next Step
Build Phase 1–4 as a single Claude Artifact (React) for a free, working prototype — no backend, no API keys needed, job descriptions pasted in manually to start.

---

## 8. Step-by-Step Execution Plan

### Step 1 — Prototype inside Claude (Day 1, zero setup)
- Build the whole app as one React Claude Artifact.
- No install, no API key, no hosting — runs immediately in chat.
- Validates the concept end-to-end: CV upload → parse → match → interview.
- **Deliverable:** working demo you can test today.

### Step 2 — Decide if you need a standalone app
Ask: does this need to run outside Claude.ai (its own URL, its own users)?
- **No** → stay on the Artifact, you're done, skip to Step 6.
- **Yes** → continue to Step 3 (turns it into a real deployable web app).

### Step 3 — Scaffold the standalone project
```bash
# Frontend
npx create-next-app@latest cv-matcher --typescript --tailwind
cd cv-matcher
npm install react-dropzone pdf-parse mammoth

# Backend (if separate from Next.js API routes)
mkdir server && cd server
npm init -y
npm install express cors dotenv
```
- Use Next.js API routes instead of a separate Express server if you want one deployable unit.

### Step 4 — Wire up the AI model
- Free option: sign up at **Groq** (console.groq.com), get a free API key, call `llama-3.3-70b-versatile`.
- Store the key in `.env.local`, never in frontend code (calls go through your API route/backend, not directly from the browser).
- Implement three server functions: `parseCV()`, `scoreMatch()`, `generateInterview()` — each just wraps a prompt from Section 5 above.

### Step 5 — Wire up job data (optional)
- Sign up for **Adzuna** (free tier) or **JSearch on RapidAPI**.
- Add a search box → call their API → let user pick a listing → auto-fill the job description field.
- Skip this step entirely if manual paste-in is enough for v1.

### Step 6 — Build the UI flow
1. CV upload/paste screen → shows parsed summary for user to confirm.
2. Job description screen (paste or pick from search) → "Analyze Match" button.
3. Results screen → match %, missing keywords, suggested rewrites.
4. Mock interview screen → chat-style Q&A, one question at a time, feedback after each answer.
5. Final report screen → summary + option to export as PDF.

### Step 7 — Add persistence (optional, later)
- Start with `localStorage` to save the last session.
- Upgrade to **Supabase** free tier only if you need login + history across devices.

### Step 8 — Test and refine
- Test with 2–3 real CVs and real job descriptions.
- Check edge cases: CV with no clear skills section, very short job descriptions, non-English text.
- Refine prompts in Section 5 based on where the AI's output is vague or wrong.

### Step 9 — Deploy (if standalone)
- Frontend + API routes: deploy free on **Vercel**.
- Add environment variables (API keys) in Vercel's dashboard, not in the repo.

### Step 10 — Iterate with the feature list
Once the core loop works, add from the earlier feature list in priority order:
1. CV rewrite suggestions
2. Cover letter generator
3. STAR-method interview scoring
4. Multi-job comparison view
5. Progress tracking over time

---

## 9. Suggested Timeline

| Week | Focus |
|---|---|
| 1 | Steps 1–2: working Artifact prototype, decide on scope |
| 2 | Steps 3–4: scaffold standalone app, wire up AI model |
| 3 | Steps 5–6: job data + full UI flow |
| 4 | Steps 7–9: persistence, testing, deploy |
| 5+ | Step 10: iterate on extra features |

---

## 10. Actual Implementation — Python Backend (FastAPI)

### 10.1 Install
```bash
mkdir cv-matcher-backend && cd cv-matcher-backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install fastapi uvicorn python-multipart pdfplumber python-docx groq python-dotenv
```

### 10.2 Project structure
```
cv-matcher-backend/
├── main.py
├── parser.py
├── ai.py
├── .env
```

### 10.3 `.env` (free Groq key — sign up at console.groq.com)
```
GROQ_API_KEY=your_free_key_here
```

### 10.4 `parser.py` — extract text from uploaded CV
```python
import pdfplumber
from docx import Document

def extract_text(file_path: str) -> str:
    if file_path.endswith(".pdf"):
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text
    elif file_path.endswith(".docx"):
        doc = Document(file_path)
        return "\n".join(p.text for p in doc.paragraphs)
    else:
        raise ValueError("Unsupported file type")
```

### 10.5 `ai.py` — the three AI calls (free via Groq/Llama 3.3)
```python
import os, json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

def _call(prompt: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content

def parse_cv(cv_text: str) -> dict:
    prompt = f"""Extract the following from this resume as valid JSON only, no extra text:
    name, skills (list), work_experience (list of role, company, duration, achievements),
    education (list), certifications (list).

    Resume text:
    {cv_text}
    """
    raw = _call(prompt)
    return json.loads(raw)

def score_match(cv_json: dict, job_description: str) -> dict:
    prompt = f"""Compare this candidate profile to the job description.
    Return valid JSON only with keys: match_percentage (0-100),
    missing_keywords (list), strengths (list), suggested_edits (list).

    Candidate profile: {json.dumps(cv_json)}
    Job description: {job_description}
    """
    raw = _call(prompt)
    return json.loads(raw)

def generate_interview_questions(cv_json: dict, job_description: str) -> list:
    prompt = f"""Based on this candidate profile and job description, generate 8 interview
    questions (mix of behavioral and role-specific technical). Return valid JSON only:
    a list of strings.

    Candidate profile: {json.dumps(cv_json)}
    Job description: {job_description}
    """
    raw = _call(prompt)
    return json.loads(raw)

def score_answer(question: str, answer: str) -> str:
    prompt = f"""You are an interview coach. Give brief, constructive feedback (2-3 sentences)
    on this answer, checking clarity, structure (STAR method), and relevance.

    Question: {question}
    Answer: {answer}
    """
    return _call(prompt)
```

### 10.6 `main.py` — API endpoints
```python
from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil, os
from parser import extract_text
from ai import parse_cv, score_match, generate_interview_questions, score_answer

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.post("/upload-cv")
async def upload_cv(file: UploadFile):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    text = extract_text(temp_path)
    os.remove(temp_path)
    parsed = parse_cv(text)
    return {"parsed_cv": parsed}

@app.post("/match")
async def match(cv_json: dict, job_description: str = Form(...)):
    result = score_match(cv_json, job_description)
    return result

@app.post("/interview/start")
async def start_interview(cv_json: dict, job_description: str = Form(...)):
    questions = generate_interview_questions(cv_json, job_description)
    return {"questions": questions}

@app.post("/interview/answer")
async def answer_feedback(question: str = Form(...), answer: str = Form(...)):
    feedback = score_answer(question, answer)
    return {"feedback": feedback}
```

### 10.7 Run it
```bash
uvicorn main:app --reload --port 8000
```
Test with the auto-generated docs at `http://localhost:8000/docs`.

### 10.8 Connect the React frontend
```javascript
// Example call from React
const res = await fetch("http://localhost:8000/upload-cv", {
  method: "POST",
  body: formData, // FormData with the file
});
const data = await res.json();
```

---

## 11. Actual Implementation — n8n (automation layer, optional)

Use n8n **on top of** the Python backend above — not instead of it. n8n is for gluing things together, not for hosting the app.

### 11.1 Example workflow: "New CV → Match → Email Report"
1. **Trigger node**: Webhook (n8n gives you a URL your frontend POSTs to when a user submits a CV + job description)
2. **HTTP Request node**: calls your FastAPI `/upload-cv` endpoint
3. **HTTP Request node**: calls `/match` with the parsed CV + job description
4. **Function node**: formats the match result into a readable summary
5. **Email/Slack node**: sends the report to the user

### 11.2 Example workflow: "Daily job re-check"
1. **Cron node**: runs every morning
2. **HTTP Request node**: pulls new listings from Adzuna/JSearch API
3. **HTTP Request node**: calls your `/match` endpoint for each new listing against a saved CV
4. **Filter node**: keeps only matches above 70%
5. **Email/Slack node**: sends a digest of good matches

### 11.3 When to actually build these in n8n
Only after the core Python + React app works standalone. n8n workflows are additive — automation on top of a working core, not a replacement for it.

I can build the n8n workflows above directly in your connected n8n instance if you want — just say which one to start with.
