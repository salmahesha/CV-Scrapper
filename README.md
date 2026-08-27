# AI-Powered CV Matcher & Mock Interview

An intelligent application that analyzes your CV against job descriptions, scores the match, identifies gaps, suggests improvements, and runs AI-powered mock interviews.

## Features

- **CV Upload/Paste** — Upload PDF/DOCX or paste your CV text directly
- **AI CV Parsing** — Automatically extracts skills, experience, education, and certifications
- **Match Scoring** — Compares your CV against any job description with a percentage score
- **Gap Analysis** — Identifies missing keywords and suggests specific improvements
- **Mock Interview** — AI-generated role-specific questions with real-time feedback
- **Interview Report** — Summary of your performance with actionable advice

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Python 3.11+ + FastAPI |
| AI Model | Groq (Llama 3.3 70B) — free tier |
| CV Parsing | pdfplumber (PDF) + python-docx (DOCX) |

## Quick Start

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd AI-Powered-CV
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# Windows (cmd):
venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up your API key
cp .env.example .env
# Edit .env and add your Groq API key (free at https://console.groq.com)

# Run the server
uvicorn main:app --reload --port 8000
```

The API docs will be at http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be at http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload-cv` | Upload PDF/DOCX → parsed CV JSON |
| POST | `/paste-cv` | Paste CV text → parsed CV JSON |
| POST | `/match` | Compare CV vs. job description → match report |
| POST | `/interview/start` | Generate interview questions |
| POST | `/interview/answer` | Get feedback on an answer |
| GET | `/health` | Health check |

## Project Structure

```
AI-Powered CV/
├── backend/
│   ├── main.py            # FastAPI app & endpoints
│   ├── ai.py              # Groq AI calls (parse, match, interview)
│   ├── parser.py           # PDF/DOCX text extraction
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment variable template
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── api/            # API client functions
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context (app state)
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Root component with routing
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── implementation-plan.md  # Detailed project plan
└── README.md               # This file
```

## Getting a Free Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Generate an API key
4. Paste it into `backend/.env`

The free tier is generous enough for development and personal use.

## License

MIT
"# CV-Scrapper" 
