import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const SkillBadge = ({ 
  skill, 
  type 
}: { 
  skill: string; 
  type: 'missing' | 'strength' 
}) => {
  const isStrength = type === 'strength';

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
        isStrength
          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/20'
          : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:border-rose-500/50 hover:bg-rose-500/20'
      }`}
    >
      {isStrength ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
      )}
      <span className="truncate max-w-[200px]">{skill}</span>
    </span>
  );
};
