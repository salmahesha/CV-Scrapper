const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ParsedCV {
  name: string;
  location?: string;
  skills: string[];
  work_experience: any[];
  education: any[];
  certifications: string[];
}

export interface MatchResult {
  match_percentage: number;
  match_summary?: string;
  missing_keywords: string[];
  strengths: string[];
  suggested_edits: string[];
}

export interface LinkedInJobResult {
  job_title: string;
  company: string;
  location: string;
  description: string;
  url: string;
}

export interface LinkedInSearchJob {
  id: string;
  job_title: string;
  company: string;
  location: string;
  url: string;
}

export interface SearchJobsResponse {
  jobs: LinkedInSearchJob[];
  query: string;
  location?: string;
  page?: number;
  total: number;
}

async function handleResponse(res: Response, fallbackError: string) {
  if (!res.ok) {
    try {
      const data = await res.json();
      throw new Error(data.detail || data.message || fallbackError);
    } catch (e: any) {
      if (e.message && e.message !== fallbackError) throw e;
      throw new Error(`${fallbackError} (${res.status}: ${res.statusText})`);
    }
  }
  return res.json();
}

export const api = {
  async uploadCV(file: File): Promise<{ parsed_cv: ParsedCV; raw_text?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/upload-cv`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res, 'Upload failed');
  },

  async pasteCV(text: string): Promise<{ parsed_cv: ParsedCV }> {
    const res = await fetch(`${API_URL}/paste-cv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv_text: text }),
    });
    return handleResponse(res, 'Paste failed');
  },

  async scrapeLinkedIn(url: string): Promise<LinkedInJobResult> {
    const res = await fetch(`${API_URL}/scrape-linkedin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return handleResponse(res, 'Failed to scrape LinkedIn job');
  },

  async matchCV(cv_json: ParsedCV, job_description: string): Promise<MatchResult> {
    const res = await fetch(`${API_URL}/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv_json, job_description }),
    });
    return handleResponse(res, 'Match analysis failed');
  },

  async startInterview(cv_json: ParsedCV, job_description: string): Promise<{ questions: string[] }> {
    const res = await fetch(`${API_URL}/interview/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv_json, job_description }),
    });
    return handleResponse(res, 'Failed to generate interview questions');
  },

  async searchJobs(skills: string[], jobTitle: string = '', location: string = 'Egypt', page: number = 0): Promise<SearchJobsResponse> {
    const res = await fetch(`${API_URL}/search-jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills, job_title: jobTitle, location, page }),
    });
    return handleResponse(res, 'Failed to search for matching jobs');
  },

  async answerQuestion(question: string, answer: string): Promise<{ feedback: string }> {
    const res = await fetch(`${API_URL}/interview/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer }),
    });
    return handleResponse(res, 'Failed to submit answer');
  }
};
