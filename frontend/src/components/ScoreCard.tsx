import React from 'react';
import { Award, Zap, AlertTriangle } from 'lucide-react';

export const ScoreCard = ({ score }: { score: number }) => {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getTierDetails = (s: number) => {
    if (s >= 80) {
      return {
        label: 'Exceptional Match',
        badge: 'Top Tier',
        color: 'text-accent-emerald',
        strokeColor: '#10b981',
        glowClass: 'glow-emerald',
        bgBadge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        icon: Award,
        summary: 'Your CV strongly aligns with this job role.'
      };
    }
    if (s >= 60) {
      return {
        label: 'Strong Match',
        badge: 'Competitive',
        color: 'text-brand-400',
        strokeColor: '#818cf8',
        glowClass: 'glow-brand',
        bgBadge: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
        icon: Zap,
        summary: 'Good alignment with key requirements.'
      };
    }
    return {
      label: 'Needs Optimization',
      badge: 'Review Gaps',
      color: 'text-accent-amber',
      strokeColor: '#f59e0b',
      glowClass: 'glow-amber',
      bgBadge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: AlertTriangle,
      summary: 'Focus on missing keywords to improve match.'
    };
  };

  const tier = getTierDetails(score);
  const Icon = tier.icon;

  return (
    <div className={`glass-card rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden ${tier.glowClass}`}>
      {/* Background radial highlight */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none" 
        style={{ background: `radial-gradient(circle at 50% 30%, ${tier.strokeColor}, transparent 70%)` }}
      />

      <div className="flex items-center justify-between w-full mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Match Assessment
        </span>
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${tier.bgBadge}`}>
          <Icon className="w-3 h-3" />
          {tier.badge}
        </span>
      </div>

      {/* SVG Circular Meter */}
      <div className="relative my-2 w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
          {/* Background circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            className="text-zinc-800"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke={tier.strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold tracking-tight text-white">
            {score}<span className="text-xl text-zinc-400 font-normal">%</span>
          </span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
            ATS Score
          </span>
        </div>
      </div>

      <h4 className={`text-base font-bold mt-2 ${tier.color}`}>
        {tier.label}
      </h4>
      <p className="text-xs text-zinc-400 mt-1 max-w-[200px]">
        {tier.summary}
      </p>
    </div>
  );
};
