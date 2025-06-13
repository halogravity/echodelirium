import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a fallback client that won't throw errors if env vars are missing
let supabase: ReturnType<typeof createSupabaseClient>;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not found. Some features may be limited.');
    // Create a mock client that won't cause errors
    supabase = {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
        getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase not configured') }),
        refreshSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase not configured') }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
        signUp: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }) }),
        delete: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase not configured') }) })
      })
    } as any;
  } else {
    supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error('Error creating Supabase client:', error);
  // Fallback to mock client
  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase initialization failed') }),
      getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase initialization failed') }),
      refreshSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase initialization failed') }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase initialization failed') }),
      signUp: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase initialization failed') }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase initialization failed') }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase initialization failed') }) }) }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase initialization failed') }) })
    })
  } as any;
}

export { supabase };

export const createClient = () => {
  return supabase;
};