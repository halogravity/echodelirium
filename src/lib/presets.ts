import { supabase } from './supabase';

export interface Preset {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  parameters: {
    filterFreq: number;
    filterRes: number;
    distortion: number;
    distortionMix: number;
    pareidoliaIntensity: number;
    chaosLevel: number;
    dreamDepth: number;
    styleInfluence: number;
    styleBlend: number;
    selectedStyles: string[];
    pitchShift: number;
    pitchMix: number;
    reverbDecay: number;
    reverbMix: number;
    midiMappings?: Record<number, string>;
  };
}

export async function savePreset(name: string, parameters: Preset['parameters']): Promise<Preset | null> {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('presets')
      .insert([
        {
          name,
          parameters,
          user_id: user.data.user.id
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
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('presets')
      .select('*')
      .eq('user_id', user.data.user.id)
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
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('presets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.data.user.id);

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
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('presets')
      .update({ parameters })
      .eq('id', id)
      .eq('user_id', user.data.user.id)
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