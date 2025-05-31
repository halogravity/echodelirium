import React, { useState, useEffect } from 'react';
import { useAuth } from './lib/auth';
import { AudioRecorder } from './components/AudioRecorder';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';
import { Moon, LogOut, BookOpen, Music, Menu, X } from 'lucide-react';
import Sequencer from './components/Sequencer';

function App() {
  const { user, loading, signOut } = useAuth();
  const [isManualOpen, setIsManualOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = useState<'recorder' | 'sequencer'>('recorder');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setCurrentPage('recorder');
    localStorage.setItem('currentPage', 'recorder');
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-[-48px] rounded-full border-2 border-red-900/10 animate-[spin_40s_linear_infinite] blur-sm" />
          <div className="absolute inset-[-36px] rounded-full border-2 border-red-900/20 animate-[spin_35s_linear_infinite_reverse] blur-sm" />
          <div className="absolute inset-[-24px] rounded-full border-2 border-red-900/30 animate-[spin_30s_linear_infinite] blur-sm" />
          <div className="absolute inset-[-12px] rounded-full border-2 border-red-900/40 animate-[spin_25s_linear_infinite_reverse] blur-sm" />
          <div className="absolute inset-[-20px] rounded-full bg-gradient-radial from-red-900/30 via-red-900/5 to-transparent animate-[pulse_4s_ease-in-out_infinite] blur-lg" />
          <div className="relative group">
            <div className="relative w-32 h-32">
              <div className="glitch relative">
                <img 
                  src="/logo.svg" 
                  alt="Echo Delirium" 
                  className="w-32 h-32 animate-[pulse_3s_ease-in-out_infinite] drop-shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjAwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="w-screen h-screen bg-black flex flex-col overflow-hidden">
        <div className="noise" />
        <div className="scanlines" />
        
        <div className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-b border-red-900/20 z-50">
          <div className="w-full px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="glitch relative w-8 h-8">
                <img src="/logo.svg" alt="Echo Delirium" className="w-8 h-8" />
              </div>
              <h1 className="text-xl font-thin text-red-500 tracking-wider glitch">Echo Delirium</h1>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-red-500/70 hover:text-red-500 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentPage('recorder')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-mono transition-colors uppercase tracking-wider border ${
                    currentPage === 'recorder' 
                      ? 'border-red-900/40 text-red-500 bg-red-900/20' 
                      : 'border-red-900/20 text-red-500/70 hover:border-red-900/40 hover:text-red-500'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Recorder
                </button>
                <button
                  onClick={() => setCurrentPage('sequencer')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-mono transition-colors uppercase tracking-wider border ${
                    currentPage === 'sequencer'
                      ? 'border-red-900/40 text-red-500 bg-red-900/20'
                      : 'border-red-900/20 text-red-500/70 hover:border-red-900/40 hover:text-red-500'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  Sequencer
                </button>
                <button
                  onClick={() => setIsManualOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors uppercase tracking-wider border border-red-900/20 hover:border-red-900/40"
                >
                  <BookOpen className="w-4 h-4" />
                  Manual
                </button>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors uppercase tracking-wider border border-red-900/20 hover:border-red-900/40"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div
            className={`md:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-red-900/20 transition-all duration-300 ${
              isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
            }`}
          >
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setCurrentPage('recorder');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 text-xs font-mono transition-colors uppercase tracking-wider border ${
                  currentPage === 'recorder' 
                    ? 'border-red-900/40 text-red-500 bg-red-900/20' 
                    : 'border-red-900/20 text-red-500/70 hover:border-red-900/40 hover:text-red-500'
                }`}
              >
                <Moon className="w-4 h-4" />
                Recorder
              </button>
              <button
                onClick={() => {
                  setCurrentPage('sequencer');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 text-xs font-mono transition-colors uppercase tracking-wider border ${
                  currentPage === 'sequencer'
                    ? 'border-red-900/40 text-red-500 bg-red-900/20'
                    : 'border-red-900/20 text-red-500/70 hover:border-red-900/40 hover:text-red-500'
                }`}
              >
                <Music className="w-4 h-4" />
                Sequencer
              </button>
              <button
                onClick={() => {
                  setIsManualOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors uppercase tracking-wider border border-red-900/20 hover:border-red-900/40"
              >
                <BookOpen className="w-4 h-4" />
                Manual
              </button>
              <button
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors uppercase tracking-wider border border-red-900/20 hover:border-red-900/40"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 pt-16 overflow-hidden">
          <div className="h-full w-full px-4 py-8 overflow-y-auto">
            <ErrorBoundary>
              {currentPage === 'recorder' ? (
                <AudioRecorder isManualOpen={isManualOpen} onManualClose={() => setIsManualOpen(false)} />
              ) : (
                <Sequencer />
              )}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;