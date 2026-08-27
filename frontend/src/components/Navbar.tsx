import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Sparkles, FileText, Briefcase, Target, Mic, RotateCcw } from 'lucide-react';

export const Navbar = () => {
  const { reset, parsedCV, jobDescription, matchResult, interviewState } = useAppContext();
  const location = useLocation();

  const steps = [
    { path: '/upload', label: 'Upload CV', icon: FileText, completed: !!parsedCV },
    { path: '/job-description', label: 'Job Role', icon: Briefcase, completed: !!jobDescription },
    { path: '/match-results', label: 'Analysis', icon: Target, completed: !!matchResult },
    { path: '/interview', label: 'Mock Interview', icon: Mic, completed: !!interviewState?.qna.length },
  ];

  const hasData = !!(parsedCV || jobDescription || matchResult || interviewState);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-dark-950/80 border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all duration-300">
              <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-400 group-hover:scale-110 transition duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-brand-400 transition">
                  Career<span className="text-brand-400">AI</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-md">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 tracking-wider font-medium uppercase">
                Smart CV & Interview Matcher
              </span>
            </div>
          </Link>

          {/* Workflow Stepper */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-dark-900/90 border border-zinc-800/90 px-3 py-1.5 rounded-full shadow-inner">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = location.pathname === step.path;
              return (
                <React.Fragment key={step.path}>
                  <Link
                    to={step.path}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                        : step.completed
                        ? 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : step.completed ? 'text-accent-emerald' : 'text-zinc-500'}`} />
                    <span>{step.label}</span>
                    {step.completed && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald"></span>
                    )}
                  </Link>
                  {idx < steps.length - 1 && (
                    <span className="text-zinc-700 text-xs select-none">/</span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {hasData && (
              <button
                onClick={() => {
                  if (window.confirm('Reset all CV, job, and interview data?')) {
                    reset();
                  }
                }}
                title="Reset session"
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-rose-500/30 transition-all duration-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Session</span>
              </button>
            )}
            
            <Link
              to="/upload"
              className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get Started</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
