import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { api } from '../api/client';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Bot, 
  User, 
  Send, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Lightbulb, 
  Volume2 
} from 'lucide-react';

export const MockInterview = () => {
  const { interviewState, setInterviewState } = useAppContext();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API if supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setAnswer((prev) => (prev ? `${prev.trim()} ${currentTranscript}` : currentTranscript));
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. You can type your answer.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  if (!interviewState || !interviewState.questions?.length) {
    return <Navigate to="/upload" replace />;
  }

  const currentQ = interviewState.questions[interviewState.currentQuestionIndex];
  const totalQuestions = interviewState.questions.length;
  const currentIndex = interviewState.currentQuestionIndex;
  const isLastQ = currentIndex === totalQuestions - 1;
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.answerQuestion(currentQ, answer);
      setFeedback(res.feedback);
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate answer');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const updatedQnA = [...interviewState.qna, {
      question: currentQ,
      answer,
      feedback: feedback || ''
    }];

    if (isLastQ) {
      setInterviewState({ ...interviewState, qna: updatedQnA });
      navigate('/interview-report');
    } else {
      setInterviewState({
        ...interviewState,
        qna: updatedQnA,
        currentQuestionIndex: currentIndex + 1
      });
      setAnswer('');
      setFeedback(null);
    }
  };

  const handleFillSampleAnswer = () => {
    setAnswer(`In my previous role as a Senior Engineer, I addressed a similar challenge by structuring the solution around clear modular architecture and automated testing. I designed the RESTful APIs using FastAPI, utilized Redis for caching high-frequency queries, and integrated vector search embeddings for real-time relevance. This reduced response latency by 40% and improved throughput significantly.`);
  };

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Header with Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Interactive AI Mock Interview
            </h2>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-dark-900 border border-zinc-800 text-brand-300">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-dark-900 h-2 rounded-full overflow-hidden border border-zinc-800">
          <div 
            className="h-full bg-gradient-to-r from-brand-600 to-indigo-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* AI Interviewer Avatar Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 mb-6 border border-brand-500/20 relative overflow-hidden glow-brand">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-600 p-0.5 shadow-lg flex-shrink-0">
            <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-brand-400" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                AI Interviewer
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald"></span>
              <span className="text-[10px] text-zinc-500">Live Evaluation Mode</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              "{currentQ}"
            </h3>
          </div>
        </div>

        {/* Simulated Sound Wave Animation */}
        <div className="flex items-center gap-1 mt-6 pt-4 border-t border-zinc-800/80 justify-end">
          <span className="text-[11px] text-zinc-500 mr-2 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-brand-400" />
            AI Audio Engine
          </span>
          <div className="flex items-center gap-0.5 h-4">
            <div className="w-1 bg-brand-500 rounded-full h-2 animate-wave" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 bg-brand-400 rounded-full h-4 animate-wave" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 bg-purple-400 rounded-full h-3 animate-wave" style={{ animationDelay: '300ms' }}></div>
            <div className="w-1 bg-brand-500 rounded-full h-4 animate-wave" style={{ animationDelay: '450ms' }}></div>
            <div className="w-1 bg-indigo-400 rounded-full h-2 animate-wave" style={{ animationDelay: '200ms' }}></div>
          </div>
        </div>
      </div>

      {/* Answer & Feedback Area */}
      {!feedback ? (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-zinc-400" />
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Your Answer (Type or Speak)
              </label>
            </div>
            
            <div className="flex items-center gap-3 text-xs">
              <span className="text-zinc-500 font-mono">
                {wordCount} words
              </span>
              <button
                type="button"
                onClick={handleFillSampleAnswer}
                className="text-[11px] text-brand-400 hover:text-brand-300 underline font-medium"
              >
                Sample Answer
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              className="w-full min-h-[160px] p-4 glass-input text-xs font-mono leading-relaxed resize-y"
              placeholder="Structure your answer using the STAR method (Situation, Task, Action, Result)..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />

            {/* Voice Mic Floating Button inside textarea area */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold shadow-lg ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/30'
                    : 'bg-dark-900 text-zinc-300 hover:text-white border border-zinc-700 hover:border-brand-500'
                }`}
                title={isListening ? 'Click to stop voice recording' : 'Click to speak your answer'}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-brand-400" />
                    <span>Voice Input</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-zinc-500 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Tip: Be concise, emphasize quantitative metrics & engineering impact.</span>
            </div>

            <button
              onClick={handleSubmitAnswer}
              disabled={loading || !answer.trim()}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xl shadow-brand-500/25"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Evaluating Answer...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Answer</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* AI Feedback Review Card */
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-zinc-800 space-y-6">
            {/* Candidate answer summary */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                <User className="w-4 h-4" />
                <span>Your Response</span>
              </div>
              <div className="p-4 rounded-xl bg-dark-950/70 text-xs text-zinc-300 border border-zinc-800 whitespace-pre-wrap leading-relaxed">
                {answer}
              </div>
            </div>

            {/* AI Feedback */}
            <div className="p-5 rounded-2xl bg-brand-500/10 border border-brand-500/30 glow-brand">
              <div className="flex items-center gap-2 mb-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>AI Interviewer Evaluation & Coaching</span>
              </div>
              <div className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {feedback}
              </div>
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="px-8 py-3.5 bg-white text-dark-950 hover:bg-zinc-200 font-bold text-xs rounded-xl shadow-xl transition flex items-center gap-2"
            >
              <span>{isLastQ ? 'Complete Interview & View Final Report' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
