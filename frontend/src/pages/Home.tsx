import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  FileCheck2, 
  Briefcase, 
  Target, 
  Mic2, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  CheckCircle 
} from 'lucide-react';

export const Home = () => {
  const workflowSteps = [
    {
      step: '01',
      title: 'Smart CV Extraction',
      description: 'Upload PDF/Word or paste text. Our AI parses skills, roles, and experience instantly.',
      icon: FileCheck2,
      badge: 'Multi-Format',
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30'
    },
    {
      step: '02',
      title: 'LinkedIn & ATS Matching',
      description: 'Fetch any LinkedIn job URL or paste description for deep gap analysis & scoring.',
      icon: Target,
      badge: 'Live LinkedIn Scraper',
      color: 'from-brand-500/20 to-purple-500/20 text-brand-400 border-brand-500/30'
    },
    {
      step: '03',
      title: 'AI Mock Interview',
      description: 'Practice role-specific interview questions with real-time feedback and speech recognition.',
      icon: Mic2,
      badge: 'Voice & AI Feedback',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
    }
  ];

  const highlights = [
    { label: 'Instant ATS Compatibility Score', icon: Zap },
    { label: 'Automated Missing Keyword Detection', icon: ShieldCheck },
    { label: 'Live LinkedIn Job Scraper & Finder', icon: Briefcase },
    { label: 'Voice-Enabled Mock Interview Simulation', icon: Mic2 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold shadow-lg shadow-brand-500/10 animate-pulse-glow">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Next-Generation Career AI & Interview Simulator</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Supercharge Your CV & <br />
          <span className="gradient-brand-text">Ace Every Technical Interview</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          Upload your resume, connect any LinkedIn job posting, and receive an automated match breakdown with tailored mock interview coaching powered by advanced AI.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Link
            to="/upload"
            className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-base font-semibold shadow-xl shadow-brand-600/30 hover:shadow-brand-600/50 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <span>Analyze Your CV Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/upload"
            className="w-full sm:w-auto px-6 py-4 glass-card hover:bg-dark-850 text-zinc-300 hover:text-white rounded-2xl text-base font-semibold border border-zinc-800 hover:border-zinc-700 transition flex items-center justify-center gap-2"
          >
            <Cpu className="w-4 h-4 text-brand-400" />
            <span>Try Demo Preset</span>
          </Link>
        </div>

        {/* Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pt-8">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-900/60 border border-zinc-800/60 text-xs text-zinc-400 font-medium text-left"
              >
                <Icon className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workflow Section */}
      <div className="mt-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How The AI System Works
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            Seamless 3-step pipeline to optimize your application from resume parsing to interview readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className="glass-card-interactive rounded-2xl p-6 relative overflow-hidden group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-zinc-800 group-hover:text-zinc-700 transition">
                      {step.step}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-gradient-to-r ${step.color}`}>
                      {step.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-dark-950 border border-zinc-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6 text-brand-400" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center gap-2 text-xs text-brand-400 font-semibold group-hover:text-brand-300">
                  <span>Step {idx + 1} of 3</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Callout Card */}
      <div className="mt-16 glass-card rounded-3xl p-8 md:p-10 border border-brand-500/30 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 glow-brand">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">
            Ready to test your readiness for your dream role?
          </h3>
          <p className="text-sm text-zinc-400 max-w-xl">
            Join candidates using AI to bridge skill gaps, optimize resumes against ATS filters, and rehearse behavioral and technical interviews.
          </p>
        </div>
        <Link
          to="/upload"
          className="flex-shrink-0 px-6 py-3.5 bg-white text-dark-950 hover:bg-zinc-100 rounded-xl font-bold text-sm shadow-xl transition-all duration-200 flex items-center gap-2"
        >
          <span>Start Free Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
