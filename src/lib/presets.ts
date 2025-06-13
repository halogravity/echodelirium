import { supabase } from './supabase';

export interface Preset {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  parameters: any;
}

export async function savePreset(name: string, parameters: Preset['parameters']): Promise<Preset | null> {
  try {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured - preset saving disabled');
      return null;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      // Try to refresh the session
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !session?.user) {
        throw new Error('Session expired. Please sign in again.');
      }
    }

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('presets')
      .insert([
        {
          name,
          parameters,
          user_id: user.id
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving preset:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in savePreset:', error);
    return null;
  }
}

export async function loadPresets(): Promise<Preset[]> {
  try {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured - using local storage for presets');
      return loadPresetsFromLocalStorage();
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      // Try to refresh the session
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !session?.user) {
        console.warn('Session expired - falling back to local storage');
        return loadPresetsFromLocalStorage();
      }
    }

    if (!user) {
      console.warn('User not authenticated - falling back to local storage');
      return loadPresetsFromLocalStorage();
    }

    const { data, error } = await supabase
      .from('presets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading presets:', error);
      return loadPresetsFromLocalStorage();
    }

    return data || [];
  } catch (error) {
    console.error('Error in loadPresets:', error);
    return loadPresetsFromLocalStorage();
  }
}

// Fallback local storage functions
function loadPresetsFromLocalStorage(): Preset[] {
  try {
    const stored = localStorage.getItem('echo-delirium-presets');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading presets from local storage:', error);
    return [];
  }
}

function savePresetToLocalStorage(preset: Preset): void {
  try {
    const presets = loadPresetsFromLocalStorage();
    presets.unshift(preset);
    localStorage.setItem('echo-delirium-presets', JSON.stringify(presets));
  } catch (error) {
    console.error('Error saving preset to local storage:', error);
  }
}

export async function deletePreset(id: string): Promise<boolean> {
  try {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      return deletePresetFromLocalStorage(id);
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      // Try to refresh the session
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !session?.user) {
        return deletePresetFromLocalStorage(id);
      }
    }

    if (!user) {
      return deletePresetFromLocalStorage(id);
    }

    const { error } = await supabase
      .from('presets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting preset:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePreset:', error);
    return deletePresetFromLocalStorage(id);
  }
}

function deletePresetFromLocalStorage(id: string): boolean {
  try {
    const presets = loadPresetsFromLocalStorage();
    const filtered = presets.filter(p => p.id !== id);
    localStorage.setItem('echo-delirium-presets', JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting preset from local storage:', error);
    return false;
  }
}

export async function updatePreset(id: string, parameters: Preset['parameters']): Promise<Preset | null> {
  try {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      return updatePresetInLocalStorage(id, parameters);
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      // Try to refresh the session
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !session?.user) {
        return updatePresetInLocalStorage(id, parameters);
      }
    }

    if (!user) {
      return updatePresetInLocalStorage(id, parameters);
    }

    const { data, error } = await supabase
      .from('presets')
      .update({ parameters })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating preset:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updatePreset:', error);
    return updatePresetInLocalStorage(id, parameters);
  }
}

function updatePresetInLocalStorage(id: string, parameters: Preset['parameters']): Preset | null {
  try {
    const presets = loadPresetsFromLocalStorage();
    const presetIndex = presets.findIndex(p => p.id === id);
    
    if (presetIndex === -1) return null;
    
    presets[presetIndex].parameters = parameters;
    localStorage.setItem('echo-delirium-presets', JSON.stringify(presets));
    
    return presets[presetIndex];
  } catch (error) {
    console.error('Error updating preset in local storage:', error);
    return null;
  }
}