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
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading presets:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in loadPresets:', error);
    return [];
  }
}

export async function deletePreset(id: string): Promise<boolean> {
  try {
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
    return false;
  }
}

export async function updatePreset(id: string, parameters: Preset['parameters']): Promise<Preset | null> {
  try {
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
    return null;
  }
}