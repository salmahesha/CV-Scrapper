import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  Award, 
  CheckCircle2, 
  Share2, 
  Check, 
  RotateCcw, 
  FileCheck2, 
  User, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  Printer 
} from 'lucide-react';

export const InterviewReport = () => {
  const { interviewState, reset, parsedCV } = useAppContext();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!interviewState || interviewState.qna.length === 0) {
    return <Navigate to="/" replace />;
  }

  const handleFinish = () => {
    reset();
    navigate('/');
  };

  const handleCopyReport = () => {
    const text = `AI Technical Interview Performance Summary
Candidate: ${parsedCV?.name || 'Candidate'}
Questions Answered: ${interviewState.qna.length}

${interviewState.qna.map((item, idx) => `
---------------------------------------------
Question ${idx + 1}: ${item.question}
Answer: ${item.answer}
AI Feedback: ${item.feedback}
`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Interview Complete</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Interview Performance Report
          </h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            Review detailed AI coaching, question ratings, and areas for refinement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 rounded-xl bg-dark-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          <button
            onClick={handleCopyReport}
            className="px-3.5 py-2.5 rounded-xl bg-dark-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Export Text</span>
              </>
            )}
          </button>

          <button
            onClick={handleFinish}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-brand-500/25"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start New Session</span>
          </button>
        </div>
      </div>

      {/* Summary Scorecard */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-brand-500/30 glow-brand flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-600 p-0.5 shadow-lg flex-shrink-0">
            <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center">
              <Award className="w-7 h-7 text-brand-400" />
            </div>
          </div>
          <div>
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
              Candidate Assessment Completed
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">
              {parsedCV?.name || 'Candidate'} &bull; Mock Simulation
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Successfully answered {interviewState.qna.length} simulated technical & behavioral questions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-zinc-800 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto justify-around sm:justify-start">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-white">
              {interviewState.qna.length}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">
              Questions
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-accent-emerald">
              100%
            </div>
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">
              Completion
            </div>
          </div>
        </div>
      </div>

      {/* Questions Breakdown */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-brand-400" />
          <span>Question-by-Question Evaluation</span>
        </h3>

        {interviewState.qna.map((item, index) => (
          <div 
            key={index} 
            className="glass-card rounded-2xl p-6 sm:p-8 border border-zinc-800 space-y-5 transition hover:border-zinc-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  Q{index + 1}
                </span>
                <h4 className="text-base font-bold text-white leading-snug">
                  {item.question}
                </h4>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* User Answer */}
              <div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <User className="w-3.5 h-3.5" />
                  <span>Your Submitted Answer</span>
                </div>
                <div className="p-4 rounded-xl bg-dark-950/70 text-xs text-zinc-300 border border-zinc-800 whitespace-pre-wrap leading-relaxed">
                  {item.answer || <span className="text-zinc-600 italic">No answer submitted.</span>}
                </div>
              </div>
              
              {/* AI Feedback */}
              <div>
                <div className="flex items-center gap-1.5 text-brand-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Coaching & Feedback</span>
                </div>
                <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed glow-brand">
                  {item.feedback}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
        <button
          onClick={() => navigate('/match-results')}
          className="px-4 py-2.5 text-xs text-zinc-400 hover:text-white font-semibold transition"
        >
          &larr; Back to Match Results
        </button>

        <button
          onClick={handleFinish}
          className="px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-xl shadow-brand-500/25 flex items-center gap-2 glow-brand"
        >
          <span>Start New CV Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
