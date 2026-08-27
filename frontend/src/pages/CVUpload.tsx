import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { api, LinkedInSearchJob, ParsedCV } from '../api/client';
import { useAppContext } from '../context/AppContext';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  GraduationCap, 
  ExternalLink, 
  Search, 
  ArrowRight, 
  User, 
  Code2, 
  RotateCw, 
  MapPin, 
  Check, 
  Globe 
} from 'lucide-react';

const SAMPLE_CV_TEXT = `Jane Doe
Senior Full-Stack & AI Engineer
Location: Cairo, Egypt
Email: jane.doe@example.com | GitHub: github.com/janedoe | LinkedIn: linkedin.com/in/janedoe

PROFESSIONAL SUMMARY
Results-driven Senior Full-Stack Engineer with 5+ years of experience building high-scale web applications, distributed systems, and integrating LLMs and AI microservices using React, TypeScript, Python, FastAPI, Docker, and PostgreSQL. Based in Cairo, Egypt.

SKILLS
- Frontend: React, TypeScript, Tailwind CSS, Next.js, Redux Toolkit, HTML5/CSS3
- Backend: Python, FastAPI, Node.js, Express, REST APIs, GraphQL
- AI & ML: LangChain, OpenAI APIs, Gemini API, Vector Databases (Pinecone/Chroma), Prompt Engineering
- Database & Cloud: PostgreSQL, Redis, MongoDB, Docker, AWS (S3, EC2, ECS), CI/CD, Git

WORK EXPERIENCE
Senior Software Engineer | TechNova Solutions | Cairo, Egypt | 2022 - Present
- Architected and built an AI-powered analytics dashboard using React, TypeScript, and FastAPI, serving 150K+ monthly active users.
- Designed vector search indexing with ChromaDB and OpenAI embeddings, reducing query search latency by 45%.
- Led a team of 4 frontend engineers, migrating legacy AngularJS apps to modern React 18 and Tailwind CSS.

Full-Stack Developer | CloudMatrix Inc. | 2019 - 2022
- Developed scalable microservices with Python and FastAPI, handling 10M+ daily API requests with 99.9% uptime.
- Engineered responsive user interfaces using React and Tailwind CSS, improving user conversion by 28%.
- Integrated Docker and GitHub Actions workflows for automated staging and production zero-downtime deployments.

EDUCATION
B.S. in Computer Science | Cairo University | 2015 - 2019
- Magna Cum Laude, Honors in Data Structures & Distributed Algorithms`;

const LOCATION_PRESETS = [
  { label: '🇪🇬 Cairo (القاهرة)', value: 'Cairo, Egypt' },
  { label: '🇪🇬 Giza (الجيزة)', value: 'Giza, Egypt' },
  { label: '🇪🇬 Alexandria (الإسكندرية)', value: 'Alexandria, Egypt' },
  { label: '🇪🇬 All Egypt (كل مصر)', value: 'Egypt' },
  { label: '🇸🇦 Riyadh (الرياض)', value: 'Riyadh, Saudi Arabia' },
  { label: '🇦🇪 Dubai (دبي)', value: 'Dubai, United Arab Emirates' },
  { label: '🌍 Remote (عن بُعد)', value: 'Remote' },
  { label: '🌐 Worldwide (عالمياً)', value: 'Worldwide' },
];

export const CVUpload = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchingJobs, setSearchingJobs] = useState(false);
  const [matchingJobs, setMatchingJobs] = useState<LinkedInSearchJob[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Egypt');
  const [jobPage, setJobPage] = useState(0);
  
  const { setParsedCV, parsedCV, setJobDescription } = useAppContext();
  const navigate = useNavigate();

  const searchForJobs = async (
    skills: string[],
    roleOverride: string = customRole,
    locOverride: string = selectedLocation,
    page: number = 0
  ) => {
    if (!skills || skills.length === 0) return;
    setSearchingJobs(true);
    try {
      const res = await api.searchJobs(skills, roleOverride, locOverride, page);
      setMatchingJobs(res.jobs || []);
      setSearchQuery(res.query || skills.slice(0, 4).join(', '));
      setJobPage(page);
    } catch (err: any) {
      console.error('Job search failed:', err.message);
    } finally {
      setSearchingJobs(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setLoading(true);
    setError('');
    setMatchingJobs([]);
    try {
      const res = await api.uploadCV(file);
      setParsedCV(res.parsed_cv);
      const loc = res.parsed_cv.location || selectedLocation;
      setSelectedLocation(loc);
      searchForJobs(res.parsed_cv.skills, '', loc, 0);
    } catch (err: any) {
      setError(err.message || 'Failed to parse uploaded CV file');
    } finally {
      setLoading(false);
    }
  }, [setParsedCV, selectedLocation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 
      'application/pdf': ['.pdf'], 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] 
    },
    maxFiles: 1
  });

  const handleParseText = async (content: string) => {
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    setMatchingJobs([]);
    try {
      const res = await api.pasteCV(content);
      setParsedCV(res.parsed_cv);
      const loc = res.parsed_cv.location || selectedLocation;
      setSelectedLocation(loc);
      searchForJobs(res.parsed_cv.skills, '', loc, 0);
    } catch (err: any) {
      setError(err.message || 'Failed to parse CV text');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setText(SAMPLE_CV_TEXT);
    handleParseText(SAMPLE_CV_TEXT);
  };

  const handleLocationChange = (newLoc: string) => {
    setSelectedLocation(newLoc);
    if (parsedCV?.skills) {
      searchForJobs(parsedCV.skills, customRole, newLoc, 0);
    }
  };

  const handleRefreshNextPage = () => {
    if (!parsedCV?.skills) return;
    const nextPage = jobPage + 1;
    searchForJobs(parsedCV.skills, customRole, selectedLocation, nextPage);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-2">
            <span>Step 1 of 4</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Upload Your CV</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Upload your resume or paste its raw text. Our AI will extract skills, experience, and search for real nearby jobs.
          </p>
        </div>

        {/* Quick Sample Button */}
        <button
          onClick={handleLoadSample}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-dark-900 border border-brand-500/30 text-brand-300 hover:text-white hover:bg-brand-500/10 hover:border-brand-500/50 text-xs font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Load Sample Resume (1-Click)</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 glow-rose">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Parsing Error: </span>
            {error}
          </div>
        </div>
      )}

      {/* Input Methods: Drag & Drop + Paste */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`glass-card rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[260px] border-2 border-dashed ${
            isDragActive
              ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
              : 'border-zinc-700/80 hover:border-brand-500/60 hover:bg-dark-850/80'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4 text-brand-400 group-hover:scale-110 transition">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            {isDragActive ? 'Drop your CV file here...' : 'Choose or drag & drop CV'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-xs mb-4">
            Supports PDF (.pdf) and Microsoft Word (.docx) formats up to 10MB
          </p>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <span className="px-2 py-0.5 rounded-md bg-dark-950 border border-zinc-800 font-mono">PDF</span>
            <span className="px-2 py-0.5 rounded-md bg-dark-950 border border-zinc-800 font-mono">DOCX</span>
          </div>
        </div>

        {/* Textarea Paste */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between min-h-[260px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" />
              <span>Or Paste CV Text</span>
            </label>
            {text && (
              <span className="text-[11px] text-zinc-500 font-mono">
                {text.length} chars
              </span>
            )}
          </div>
          
          <textarea
            className="w-full flex-grow min-h-[140px] p-3.5 glass-input text-xs leading-relaxed resize-none font-mono"
            placeholder="Paste raw resume text, bullet points, or markdown here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="mt-4 flex items-center justify-between">
            {text ? (
              <button
                onClick={() => setText('')}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Clear Text
              </button>
            ) : <div />}

            <button
              onClick={() => handleParseText(text)}
              disabled={loading || !text.trim()}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-brand-500/20"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Parsing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Parse Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading Banner */}
      {loading && (
        <div className="glass-card rounded-2xl p-6 text-center mb-8 border border-brand-500/30 flex items-center justify-center gap-3 glow-brand">
          <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-brand-300">
            Extracting candidate profile, technical skills, and experience with AI...
          </span>
        </div>
      )}

      {/* Parsed CV Overview Card */}
      {parsedCV && !loading && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-8 border border-emerald-500/30 glow-emerald">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">
                    {parsedCV.name || 'Candidate Profile'}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Parsed
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                  {parsedCV.location && (
                    <span className="text-emerald-300 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {parsedCV.location} &bull;
                    </span>
                  )}
                  <span>{parsedCV.skills?.length || 0} skills &bull; {parsedCV.work_experience?.length || 0} roles &bull; {parsedCV.education?.length || 0} education records</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/job-description')}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-brand-500/20 transition flex items-center justify-center gap-2 group"
            >
              <span>Next: Match Job Target</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Skills Breakdown */}
          {parsedCV.skills && parsedCV.skills.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Detected Skills ({parsedCV.skills.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedCV.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience preview if present */}
          {parsedCV.work_experience && parsedCV.work_experience.length > 0 && (
            <div className="mt-6 pt-6 border-t border-zinc-800/80">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Work Experience ({parsedCV.work_experience.length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {parsedCV.work_experience.map((exp: any, i: number) => {
                  const title = typeof exp === 'string' ? exp : exp.role || exp.title || exp.company || 'Experience Item';
                  const company = typeof exp === 'object' ? exp.company || exp.organization : '';
                  const duration = typeof exp === 'object' ? exp.duration || exp.dates : '';
                  return (
                    <div key={i} className="p-3.5 rounded-xl bg-dark-950/60 border border-zinc-800 text-xs">
                      <div className="font-semibold text-zinc-200">{title}</div>
                      {company && <div className="text-zinc-400 mt-0.5">{company}</div>}
                      {duration && <div className="text-zinc-500 text-[11px] mt-0.5">{duration}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommended Real Nearby LinkedIn Jobs Section */}
      {parsedCV && (
        <div className="mt-10">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0077B5]/20 border border-[#0077B5]/40 flex items-center justify-center text-[#0077B5]">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Real Nearby LinkedIn Job Postings
                  <span className="text-[10px] font-semibold bg-[#0077B5]/20 text-[#38bdf8] border border-[#0077B5]/30 px-2 py-0.5 rounded-full">
                    Live LinkedIn API
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Showing actual open vacancies for: <span className="text-zinc-200 font-medium">{searchQuery}</span>
                </p>
              </div>
            </div>

            {/* Refresh / Shuffle Button */}
            <button
              onClick={handleRefreshNextPage}
              disabled={searchingJobs}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-dark-900 border border-brand-500/40 hover:border-brand-400 text-brand-300 hover:text-white text-xs font-semibold transition flex items-center gap-2 shadow-lg hover:shadow-brand-500/20"
              title="Fetch new batch of matching jobs"
            >
              <RotateCw className={`w-3.5 h-3.5 ${searchingJobs ? 'animate-spin text-brand-400' : ''}`} />
              <span>{searchingJobs ? 'Fetching Jobs...' : 'Reload New Jobs (تحديث الوظائف)'}</span>
            </button>
          </div>

          {/* Location Filters Bar */}
          <div className="glass-card rounded-2xl p-4 mb-6 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                <MapPin className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Select Job Location (مكان الوظيفة):</span>
              </div>

              {/* Custom search filter */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Custom city or role (e.g. Cairo, React)..."
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchForJobs(parsedCV.skills, customRole, selectedLocation, 0)}
                  className="px-3 py-1.5 glass-input text-xs w-48"
                />
                <button
                  onClick={() => searchForJobs(parsedCV.skills, customRole, selectedLocation, 0)}
                  disabled={searchingJobs}
                  className="px-3 py-1.5 bg-dark-900 border border-zinc-700 hover:border-brand-500 text-zinc-300 hover:text-white rounded-xl text-xs font-medium transition flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Quick Location Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {LOCATION_PRESETS.map((loc, idx) => {
                const isSelected = selectedLocation === loc.value;
                return (
                  <button
                    key={idx}
                    onClick={() => handleLocationChange(loc.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/20'
                        : 'bg-dark-950/80 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span>{loc.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job List */}
          {searchingJobs ? (
            <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 border border-zinc-800">
              <div className="w-6 h-6 border-2 border-[#0077B5] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-zinc-400">
                Searching real live LinkedIn jobs in <span className="text-white font-semibold">{selectedLocation}</span>...
              </span>
            </div>
          ) : matchingJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchingJobs.map((job, index) => (
                <div
                  key={job.id || index}
                  className="glass-card-interactive rounded-2xl p-5 block group relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white group-hover:text-brand-400 transition truncate text-sm">
                          {job.job_title}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 truncate flex items-center gap-1.5">
                          <span className="text-zinc-500">&bull;</span>
                          <span className="font-medium text-zinc-300">{job.company}</span>
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-1 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-accent-cyan flex-shrink-0" />
                          <span>{job.location || selectedLocation}</span>
                        </p>
                      </div>
                      
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg bg-dark-950 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#0077B5] transition flex-shrink-0"
                        title="View official job post on LinkedIn"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2 text-[11px]">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-[#38bdf8] bg-[#0077B5]/15 border border-[#0077B5]/30 px-2.5 py-1 rounded-lg hover:bg-[#0077B5]/25 transition"
                    >
                      <Globe className="w-3 h-3" />
                      <span>Open on LinkedIn</span>
                    </a>

                    <button
                      onClick={() => {
                        navigate(`/job-description`);
                      }}
                      className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 transition"
                    >
                      <span>Match This Role &rarr;</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center text-xs text-zinc-500 border border-zinc-800 space-y-2">
              <p>No job postings found for the current combination. Try clicking another location pill above or search for a specific title.</p>
              <button
                onClick={handleRefreshNextPage}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-500 transition"
              >
                Reload Other Jobs
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
