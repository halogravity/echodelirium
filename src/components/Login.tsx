import React, { useState } from 'react';
import { Skull, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../lib/auth';
import ErrorMessage from './ErrorMessage';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { error, signIn, signUp, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      // Error is handled by useAuth
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="noise" />
      <div className="scanlines" />
      <div className="max-w-md w-full bg-zinc-900/40 backdrop-blur-xl p-8 border border-red-900/20">
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-[-8px] rounded-full border-4 border-red-900/50 shadow-[0_0_25px_rgba(220,38,38,0.2)] animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-[-16px] rounded-full border border-red-900/30 shadow-[0_0_15px_rgba(220,38,38,0.1)] animate-[spin_15s_linear_infinite_reverse]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Skull className="w-24 h-24 text-red-900/30 animate-[pulse_4s_ease-in-out_infinite]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent rounded-full animate-[pulse_6s_ease-in-out_infinite]" />
          </div>
          <h2 className="text-2xl font-thin text-red-500 tracking-wider">Echo Delirium</h2>
          <p className="text-red-300/60 text-xs font-mono uppercase tracking-[0.5em] mt-2">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {error && (
          <ErrorMessage 
            message={error.message} 
            onDismiss={clearError}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-black/30 border border-red-900/30 text-red-200 px-4 py-3 placeholder:text-red-200/30 focus:outline-none focus:border-red-500/50 font-mono text-sm"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-black/30 border border-red-900/30 text-red-200 px-4 py-3 placeholder:text-red-200/30 focus:outline-none focus:border-red-500/50 font-mono text-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600/20 border border-red-600/50 text-red-500 hover:border-red-600 hover:text-red-600 transition-all duration-300 py-3 font-mono uppercase tracking-wider text-sm flex items-center justify-center gap-2"
          >
            {isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                Sign Up
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              clearError();
            }}
            className="inline-flex items-center gap-2 text-red-500/50 hover:text-red-500 transition-colors text-sm font-mono group"
          >
            <span className="relative">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <span className="absolute -bottom-px left-0 w-full h-px bg-red-500/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </span>
            <span className="text-red-500">
              {isSignUp ? 'Sign in' : 'Sign up'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;