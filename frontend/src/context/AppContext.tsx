import React, { createContext, useContext, useState, useEffect } from 'react';
import { ParsedCV, MatchResult } from '../api/client';

export interface QnA {
  question: string;
  answer: string;
  feedback: string;
}

export interface InterviewState {
  questions: string[];
  currentQuestionIndex: number;
  qna: QnA[];
}

interface AppState {
  parsedCV: ParsedCV | null;
  jobDescription: string;
  matchResult: MatchResult | null;
  interviewState: InterviewState | null;
}

interface AppContextType extends AppState {
  setParsedCV: (cv: ParsedCV | null) => void;
  setJobDescription: (jd: string) => void;
  setMatchResult: (result: MatchResult | null) => void;
  setInterviewState: (state: InterviewState | null) => void;
  reset: () => void;
}

const defaultState: AppState = {
  parsedCV: null,
  jobDescription: '',
  matchResult: null,
  interviewState: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('ai_cv_state');
    return saved ? JSON.parse(saved) : defaultState;
  });

  useEffect(() => {
    localStorage.setItem('ai_cv_state', JSON.stringify(state));
  }, [state]);

  const setParsedCV = (cv: ParsedCV | null) => setState(s => ({ ...s, parsedCV: cv }));
  const setJobDescription = (jd: string) => setState(s => ({ ...s, jobDescription: jd }));
  const setMatchResult = (result: MatchResult | null) => setState(s => ({ ...s, matchResult: result }));
  const setInterviewState = (interview: InterviewState | null) => setState(s => ({ ...s, interviewState: interview }));
  const reset = () => setState(defaultState);

  return (
    <AppContext.Provider value={{
      ...state,
      setParsedCV,
      setJobDescription,
      setMatchResult,
      setInterviewState,
      reset
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
