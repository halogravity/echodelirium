import { supabase } from './supabase';

export interface Sample {
  id: string;
  name: string;
  user_id: string | null;
  storage_path: string;
  type: string;
  created_at: string;
}

export async function uploadSample(file: Blob, fileName: string, type: string): Promise<string | null> {
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

    // Validate file type
    if (!(file instanceof Blob) || !file.type.startsWith('audio/')) {
      throw new Error('Invalid file type. Please upload an audio file.');
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File too large. Maximum size is 10MB.');
    }

    // Include user ID in storage path to enforce ownership
    const storagePath = `samples/${user.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('echobucket')
      .upload(storagePath, file, {
        contentType: 'audio/wav',
        upsert: false
      });

    if (error) {
      console.error('Error uploading sample:', error);
      return null;
    }

    // Save metadata
    const { data: sampleData, error: metadataError } = await supabase
      .from('samples')
      .insert([
        {
          name: fileName.replace('.wav', ''),
          storage_path: data.path,
          user_id: user.id,
          type: type
        }
      ])
      .select()
      .single();

    if (metadataError) {
      console.error('Error saving sample metadata:', metadataError);
      return null;
    }

    return data.path;
  } catch (error) {
    console.error('Error in uploadSample:', error);
    return null;
  }
}

export async function getSampleUrl(path: string): Promise<string | null> {
  try {
    if (!path) {
      throw new Error('Invalid path provided');
    }

    // Handle default samples (those with just a filename)
    if (!path.includes('/')) {
      return `/samples/${path}`;
    }

    // Get signed URL for user samples
    const { data, error } = await supabase.storage
      .from('echobucket')
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error getting sample URL:', error);
    return null;
  }
}

export async function loadSamples(): Promise<Sample[]> {
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

    // Get user samples
    const { data: userSamples, error } = await supabase
      .from('samples')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading user samples:', error);
      return [];
    }

    // Get default samples
    const { data: defaultSamples, error: defaultError } = await supabase
      .from('default_samples')
      .select('*')
      .order('created_at', { ascending: false });

    if (defaultError) {
      console.error('Error loading default samples:', defaultError);
      return userSamples || [];
    }

    // Combine and return all samples
    return [
      ...(userSamples || []),
      ...(defaultSamples || []).map(sample => ({
        ...sample,
        user_id: null // Mark as default sample
      }))
    ];
  } catch (error) {
    console.error('Error in loadSamples:', error);
    return [];
  }
}

export async function deleteSample(id: string): Promise<boolean> {
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

    // Get the sample to find its storage path
    const { data: sample, error: fetchError } = await supabase
      .from('samples')
      .select('storage_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !sample) {
      console.error('Error fetching sample:', fetchError);
      return false;
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('echobucket')
      .remove([sample.storage_path]);

    if (storageError) {
      console.error('Error deleting sample from storage:', storageError);
      return false;
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('samples')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Error deleting sample metadata:', dbError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteSample:', error);
    return false;
  }
}