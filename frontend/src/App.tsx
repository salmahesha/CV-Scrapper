import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { CVUpload } from './pages/CVUpload';
import { JobDescription } from './pages/JobDescription';
import { MatchResults } from './pages/MatchResults';
import { MockInterview } from './pages/MockInterview';
import { InterviewReport } from './pages/InterviewReport';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-dark-950 text-zinc-100 flex flex-col relative selection:bg-brand-500 selection:text-white font-sans">
          {/* Ambient Background Glows */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-brand-600/10 blur-[130px] rounded-full"></div>
            <div className="absolute top-1/3 -left-40 w-[600px] h-[400px] bg-purple-600/5 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-10 -right-40 w-[600px] h-[400px] bg-accent-cyan/5 blur-[120px] rounded-full"></div>
          </div>

          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/upload" element={<CVUpload />} />
                <Route path="/job-description" element={<JobDescription />} />
                <Route path="/match-results" element={<MatchResults />} />
                <Route path="/interview" element={<MockInterview />} />
                <Route path="/interview-report" element={<InterviewReport />} />
              </Routes>
            </main>
            <footer className="border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse"></span>
                  <span>AI Career Intelligence Engine v2.0</span>
                </div>
                <div>FastAPI • Gemini Flash • Modern Dark GUI</div>
              </div>
            </footer>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
