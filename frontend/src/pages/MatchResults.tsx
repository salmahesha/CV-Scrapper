import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ScoreCard } from '../components/ScoreCard';
import { SkillBadge } from '../components/SkillBadge';
import { api } from '../api/client';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Copy, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Mic2, 
  Share2, 
  FileCheck 
} from 'lucide-react';

export const MatchResults = () => {
  const { matchResult, parsedCV, jobDescription, setInterviewState } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedKeywords, setCopiedKeywords] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  useEffect(() => {
    if (matchResult && matchResult.match_percentage >= 70) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [matchResult]);

  if (!matchResult || !parsedCV) return <Navigate to="/upload" replace />;

  const startInterview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.startInterview(parsedCV, jobDescription);
      setInterviewState({
        questions: res.questions,
        currentQuestionIndex: 0,
        qna: []
      });
      navigate('/interview');
    } catch (err: any) {
      setError(err.message || 'Failed to generate tailored interview questions');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKeywords = () => {
    if (!matchResult.missing_keywords?.length) return;
    navigator.clipboard.writeText(matchResult.missing_keywords.join(', '));
    setCopiedKeywords(true);
    setTimeout(() => setCopiedKeywords(false), 2000);
  };

  const handleCopyReport = () => {
    const reportText = `AI CV Match Report
Candidate: ${parsedCV.name || 'Candidate'}
Match Score: ${matchResult.match_percentage}%

Strengths:
${matchResult.strengths?.map(s => `- ${s}`).join('\n') || 'None'}

Missing Keywords:
${matchResult.missing_keywords?.map(k => `- ${k}`).join('\n') || 'None'}

Suggested Edits:
${matchResult.suggested_edits?.map(e => `- ${e}`).join('\n') || 'None'}`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-2">
            <span>Step 3 of 4 &bull; AI Evaluation</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Role Compatibility Report
          </h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            Analysis for <span className="text-zinc-200 font-semibold">{parsedCV.name || 'Candidate'}</span> against target role requirements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyReport}
            className="px-4 py-2.5 rounded-xl bg-dark-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
          >
            {copiedReport ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Report Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Export Report</span>
              </>
            )}
          </button>

          <button 
            onClick={startInterview}
            disabled={loading}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xl shadow-brand-500/25 flex items-center gap-2 glow-brand"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating Questions...</span>
              </>
            ) : (
              <>
                <Mic2 className="w-4 h-4 text-brand-200" />
                <span>Start Mock Interview</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Match Summary Callout */}
      {matchResult.match_summary && (
        <div className="glass-card rounded-2xl p-5 border border-brand-500/30 flex items-start gap-3.5 glow-brand">
          <Sparkles className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-brand-300 uppercase tracking-wider block mb-0.5">
              Executive AI Fit Verdict (تقييم التوافق)
            </span>
            <p className="text-xs text-zinc-200 leading-relaxed">
              {matchResult.match_summary}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 glow-rose">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Score Card + Strengths & Missing Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Circular Score Card */}
        <div className="lg:col-span-1">
          <ScoreCard score={matchResult.match_percentage} />
        </div>
        
        {/* Right Column: Strengths & Missing Gaps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Strengths */}
          <div className="glass-card rounded-2xl p-6 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Identified Strengths & Matches ({matchResult.strengths?.length || 0})</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {matchResult.strengths?.length ? (
                matchResult.strengths.map((s, i) => (
                  <SkillBadge key={i} skill={s} type="strength" />
                ))
              ) : (
                <span className="text-xs text-zinc-500 italic">No direct keyword overlap identified.</span>
              )}
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="glass-card rounded-2xl p-6 border border-rose-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Missing ATS Keywords & Skills ({matchResult.missing_keywords?.length || 0})</span>
              </div>

              {matchResult.missing_keywords && matchResult.missing_keywords.length > 0 && (
                <button
                  onClick={handleCopyKeywords}
                  className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition"
                >
                  {copiedKeywords ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {matchResult.missing_keywords?.length ? (
                matchResult.missing_keywords.map((k, i) => (
                  <SkillBadge key={i} skill={k} type="missing" />
                ))
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Outstanding! You matched all target role requirements.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Edits Section */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-zinc-800">
        <div className="flex items-center gap-2.5 text-brand-400 font-bold text-base mb-4">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <span>Tailored Recommendations to Improve Your Match Score</span>
        </div>

        <div className="space-y-3">
          {matchResult.suggested_edits?.length ? (
            matchResult.suggested_edits.map((edit, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-dark-950/70 border border-zinc-800/80 flex items-start gap-3.5 text-xs text-zinc-300 leading-relaxed"
              >
                <div className="w-5 h-5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                  {i + 1}
                </div>
                <div className="flex-1">{edit}</div>
              </div>
            ))
          ) : (
            <div className="text-xs text-zinc-400">
              Your resume aligns exceptionally well with the role requirements.
            </div>
          )}
        </div>
      </div>

      {/* Action Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
        <button
          onClick={() => navigate('/job-description')}
          className="px-4 py-2.5 text-xs text-zinc-400 hover:text-white font-semibold transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Adjust Job Role</span>
        </button>

        <button 
          onClick={startInterview}
          disabled={loading}
          className="px-8 py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xl shadow-brand-500/25 flex items-center gap-2 glow-brand"
        >
          {loading ? (
            <span>Generating Questions...</span>
          ) : (
            <>
              <Mic2 className="w-4 h-4 text-brand-200" />
              <span>Continue to AI Mock Interview</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
