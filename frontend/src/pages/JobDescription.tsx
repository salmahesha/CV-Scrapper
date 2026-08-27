import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { api, LinkedInJobResult } from '../api/client';
import { useAppContext } from '../context/AppContext';
import { 
  Briefcase, 
  Link2, 
  FileEdit, 
  Sparkles, 
  Building2, 
  MapPin, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

const JOB_PRESETS = [
  {
    title: 'Senior Full-Stack & AI Engineer',
    company: 'NextGen Cloud AI',
    description: `About the Role:
We are looking for an experienced Senior Full-Stack Engineer to join our core AI engineering team. In this role, you will build user-facing AI applications, design real-time data pipelines, and architect scalable APIs.

Key Responsibilities:
- Build and maintain high-performance web applications using React, TypeScript, and modern state management.
- Develop and scale backend microservices in Python (FastAPI) and PostgreSQL.
- Integrate LLM APIs (OpenAI, Gemini, Anthropic) and vector databases (Pinecone, ChromaDB, pgvector).
- Optimize ATS search, caching (Redis), and containerized microservices (Docker, Kubernetes).
- Collaborate with product designers and engineers to deliver intuitive, high-impact features.

Required Qualifications:
- 4+ years of professional software engineering experience.
- Strong proficiency in React, TypeScript, Python, and FastAPI.
- Experience with Docker, CI/CD pipelines, and cloud platforms (AWS or GCP).
- Familiarity with Vector Search, RAG architectures, and AI model orchestration.
- Excellent communication and problem-solving skills.`
  },
  {
    title: 'AI / Machine Learning Engineer',
    company: 'Neural Labs Global',
    description: `Position: AI / Machine Learning Engineer
Location: Remote

We are seeking a Machine Learning Engineer to design and deploy state-of-the-art NLP, RAG, and generative AI systems.

Requirements:
- Strong Python programming, PyTorch or TensorFlow experience.
- Deep expertise in LLM fine-tuning, embeddings, LangChain, and Vector DBs.
- Experience deploying ML microservices using FastAPI and Docker in cloud environments.
- Strong knowledge of algorithms, data structures, and mathematical optimization.`
  },
  {
    title: 'Frontend Engineer (React & TypeScript)',
    company: 'Starlight Tech',
    description: `Position: Senior Frontend Engineer
Stack: React, TypeScript, Tailwind CSS, Next.js

Responsibilities:
- Create delightful, accessible, and responsive user interfaces with high visual polish.
- Optimize frontend web performance, core web vitals, and asset delivery.
- Collaborate with backend engineers to integrate REST and GraphQL endpoints.`
  }
];

export const JobDescription = () => {
  const { parsedCV, jobDescription, setJobDescription, setMatchResult } = useAppContext();
  const [activeTab, setActiveTab] = useState<'linkedin' | 'manual'>('linkedin');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [scrapedInfo, setScrapedInfo] = useState<LinkedInJobResult | null>(null);
  
  const [fetching, setFetching] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!parsedCV) return <Navigate to="/upload" replace />;

  const handleScrapeLinkedIn = async () => {
    if (!linkedinUrl.trim()) return;
    setFetching(true);
    setError('');
    try {
      const res = await api.scrapeLinkedIn(linkedinUrl);
      setScrapedInfo(res);
      setJobDescription(res.description);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch job details from LinkedIn URL');
    } finally {
      setFetching(false);
    }
  };

  const handleSelectPreset = (preset: typeof JOB_PRESETS[0]) => {
    setJobDescription(preset.description);
    setScrapedInfo({
      job_title: preset.title,
      company: preset.company,
      location: 'Remote / Worldwide',
      description: preset.description,
      url: ''
    });
    setError('');
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please provide or scrape a job description first.');
      return;
    }
    setAnalyzing(true);
    setError('');
    try {
      const res = await api.matchCV(parsedCV, jobDescription);
      setMatchResult(res);
      navigate('/match-results');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze match between CV and job description');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-2">
            <span>Step 2 of 4</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Job Target & Description</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Provide the target job posting to compare against <span className="text-brand-300 font-semibold">{parsedCV.name || 'your CV'}</span>.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 font-medium hidden sm:inline">Presets:</span>
          {JOB_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset)}
              className="px-3 py-1.5 rounded-xl bg-dark-900 border border-zinc-800 hover:border-brand-500/50 hover:bg-brand-500/10 text-zinc-300 hover:text-white text-xs font-medium transition"
            >
              {preset.title.split(' ')[0]} Role
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-dark-900/90 border border-zinc-800 p-1 rounded-2xl max-w-md mx-auto mb-8">
        <button
          onClick={() => { setActiveTab('linkedin'); setError(''); }}
          className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'linkedin'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Link2 className="w-4 h-4 text-sky-400" />
          <span>LinkedIn URL Scraper</span>
        </button>

        <button
          onClick={() => { setActiveTab('manual'); setError(''); }}
          className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'manual'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileEdit className="w-4 h-4 text-brand-400" />
          <span>Manual Text Input</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 glow-rose">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Error: </span>
            {error}
          </div>
        </div>
      )}

      {/* Tab 1: LinkedIn URL Extractor */}
      {activeTab === 'linkedin' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              LinkedIn Job Posting URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Link2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  className="w-full pl-10 pr-4 py-3 glass-input text-xs"
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScrapeLinkedIn()}
                />
              </div>
              <button
                onClick={handleScrapeLinkedIn}
                disabled={fetching || !linkedinUrl.trim()}
                className="px-6 py-3 bg-[#0077B5] hover:bg-[#006097] disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
              >
                {fetching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Scraping LinkedIn...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract Job Data</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2.5">
              Works with any public LinkedIn job link (e.g. `https://linkedin.com/jobs/view/123456789`).
            </p>
          </div>

          {/* Scraped Job Preview */}
          {scrapedInfo && (
            <div className="glass-card rounded-2xl p-6 sm:p-8 border border-emerald-500/30 glow-emerald">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-4">
                <CheckCircle2 className="w-4 h-4" />
                <span>Job Posting Successfully Extracted</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-dark-950/80 border border-zinc-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Title</span>
                    <p className="text-xs font-bold text-white truncate">{scrapedInfo.job_title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Company</span>
                    <p className="text-xs font-bold text-white truncate">{scrapedInfo.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-accent-cyan flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Location</span>
                    <p className="text-xs font-bold text-white truncate">{scrapedInfo.location || 'Remote / Unspecified'}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Extracted Job Description Preview
                </label>
                <div className="max-h-56 overflow-y-auto p-4 rounded-xl bg-dark-950/60 text-xs text-zinc-300 whitespace-pre-wrap border border-zinc-800 leading-relaxed font-mono">
                  {jobDescription}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Manual Text Input */}
      {activeTab === 'manual' && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Job Description Text
            </label>
            {jobDescription && (
              <span className="text-[11px] text-zinc-500 font-mono">
                {jobDescription.length} chars
              </span>
            )}
          </div>
          <textarea
            className="w-full min-h-[260px] p-4 glass-input text-xs font-mono leading-relaxed resize-y"
            placeholder="Paste the job description, key responsibilities, qualifications, and required skills here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
      )}

      {/* Footer Nav */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800">
        <button
          onClick={() => navigate('/upload')}
          className="px-4 py-2.5 text-xs text-zinc-400 hover:text-white font-semibold transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to CV Upload</span>
        </button>

        <button
          onClick={handleAnalyze}
          disabled={analyzing || !jobDescription.trim()}
          className="px-8 py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xl shadow-brand-500/25 glow-brand"
        >
          {analyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Matching & Analyzing ATS Fit...</span>
            </>
          ) : (
            <>
              <span>Run AI Match Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
