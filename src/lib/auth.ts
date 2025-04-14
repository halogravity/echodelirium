import { useState, useEffect } from 'react';
import { createClient, User, AuthError } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setAuthState(state => ({
          ...state,
          error: new Error(error.message),
          loading: false,
        }));
        return;
      }

      setAuthState(state => ({
        ...state,
        user: session?.user ?? null,
        loading: false,
      }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(state => ({
        ...state,
        user: session?.user ?? null,
        loading: false,
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthError = (error: AuthError) => {
    let message = 'An error occurred during authentication';
    
    // Map common auth errors to user-friendly messages
    if (error.message.includes('Email not confirmed')) {
      message = 'Please check your email to confirm your account';
    } else if (error.message.includes('Invalid login credentials')) {
      message = 'Invalid email or password';
    } else if (error.message.includes('Email already registered')) {
      message = 'An account with this email already exists';
    } else if (error.message.includes('Password is too short')) {
      message = 'Password must be at least 6 characters long';
    } else if (error.message.includes('session_not_found')) {
      message = 'Your session has expired. Please sign in again.';
    }

    return new Error(message);
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw handleAuthError(error);
      return session;
    } catch (error) {
      setAuthState(state => ({
        ...state,
        error: error as Error,
      }));
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw handleAuthError(error);
    } catch (error) {
      setAuthState(state => ({
        ...state,
        error: error as Error,
      }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw handleAuthError(error);
    } catch (error) {
      setAuthState(state => ({
        ...state,
        error: error as Error,
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw handleAuthError(error);
    } catch (error) {
      setAuthState(state => ({
        ...state,
        error: error as Error,
      }));
      throw error;
    }
  };

  const clearError = () => {
    setAuthState(state => ({
      ...state,
      error: null,
    }));
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    clearError,
    refreshSession,
  };
}

export { supabase };