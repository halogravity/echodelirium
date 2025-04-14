import React, { useState } from 'react';
import { useAuth } from './lib/auth';
import AudioRecorder from './components/AudioRecorder';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';
import { Moon, LogOut, BookOpen } from 'lucide-react';

function App() {
  const { user, loading, signOut } = useAuth();
  const [isManualOpen, setIsManualOpen] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          {/* Loading animation */}
          <div className="absolute inset-[-48px] rounded-full border-2 border-red-900/10 animate-[spin_40s_linear_infinite] blur-sm" />
          <div className="absolute inset-[-36px] rounded-full border-2 border-red-900/20 animate-[spin_35s_linear_infinite_reverse] blur-sm" />
          <div className="absolute inset-[-24px] rounded-full border-2 border-red-900/30 animate-[spin_30s_linear_infinite] blur-sm" />
          <div className="absolute inset-[-12px] rounded-full border-2 border-red-900/40 animate-[spin_25s_linear_infinite_reverse] blur-sm" />
          
          {/* Blood mist effect */}
          <div className="absolute inset-[-20px] rounded-full bg-gradient-radial from-red-900/30 via-red-900/5 to-transparent animate-[pulse_4s_ease-in-out_infinite] blur-lg" />
          
          {/* Main logo */}
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
                <img 
                  src="/logo.svg" 
                  alt=""
                  className="absolute inset-0 w-32 h-32 opacity-75"
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
                    transform: 'translate(-0.025em, -0.0125em)',
                    animation: 'glitch 650ms infinite'
                  }}
                />
                <img 
                  src="/logo.svg" 
                  alt=""
                  className="absolute inset-0 w-32 h-32 opacity-75"
                  style={{
                    clipPath: 'polygon(0 80%, 100% 20%, 100% 100%, 0 100%)',
                    transform: 'translate(0.0125em, 0.025em)',
                    animation: 'glitch 375ms infinite'
                  }}
                />
              </div>
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Moon className="w-16 h-16 text-red-900/30 animate-[pulse_4s_ease-in-out_infinite_0.5s]" />
              </div>
            </div>

            {/* Evil eyes glow effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-red-600/70 shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-[pulse_2s_ease-in-out_infinite]" style={{ transform: 'translate(-12px, -4px)' }} />
              <div className="w-2 h-2 rounded-full bg-red-600/70 shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-[pulse_2s_ease-in-out_infinite]" style={{ transform: 'translate(12px, -4px)' }} />
            </div>

            {/* Loading text */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-12 text-center">
              <h1 className="logo-text text-3xl mb-4 font-thin text-red-500 tracking-wider glitch">
                Echo Delirium
                <span>Echo Delirium</span>
                <span>Echo Delirium</span>
              </h1>
              <p className="text-red-900/60 text-xs font-mono uppercase tracking-[0.5em]">
                Initializing...
              </p>
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
      <div className="min-h-screen bg-black">
        <div className="noise" />
        <div className="scanlines" />
        
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-b border-red-900/20 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="glitch relative w-8 h-8">
                <img 
                  src="/logo.svg" 
                  alt="Echo Delirium" 
                  className="w-8 h-8"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjAwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=';
                  }}
                />
                <img 
                  src="/logo.svg" 
                  alt=""
                  className="absolute inset-0 w-8 h-8 opacity-75"
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
                    transform: 'translate(-0.025em, -0.0125em)',
                    animation: 'glitch 650ms infinite'
                  }}
                />
                <img 
                  src="/logo.svg" 
                  alt=""
                  className="absolute inset-0 w-8 h-8 opacity-75"
                  style={{
                    clipPath: 'polygon(0 80%, 100% 20%, 100% 100%, 0 100%)',
                    transform: 'translate(0.0125em, 0.025em)',
                    animation: 'glitch 375ms infinite'
                  }}
                />
              </div>
              <h1 className="text-xl font-thin text-red-500 tracking-wider glitch">
                Echo Delirium
                <span>Echo Delirium</span>
                <span>Echo Delirium</span>
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-xs font-mono text-red-500/50 uppercase tracking-wider">
                Neural Audio Corruption Engine
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsManualOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors uppercase tracking-wider"
                >
                  <BookOpen className="w-4 h-4" />
                  Manual
                </button>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-red-500/70 hover:text-red-500 transition-colors uppercase tracking-wider"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content with padding for header */}
        <div className="pt-16">
          <AudioRecorder isManualOpen={isManualOpen} onManualClose={() => setIsManualOpen(false)} />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;