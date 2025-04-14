import { supabase } from './supabase';

export async function uploadRecording(file: Blob, fileName: string): Promise<string | null> {
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

    // Include user ID in storage path to enforce ownership
    const storagePath = `recordings/${user.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('echobucket')
      .upload(storagePath, file, {
        contentType: 'audio/wav',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    return data.path;
  } catch (error) {
    console.error('Error in uploadRecording:', error);
    return null;
  }
}

export async function saveRecordingMetadata(name: string, storagePath: string) {
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
      .from('recordings')
      .insert([
        {
          name,
          storage_path: storagePath,
          user_id: user.id
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving recording metadata:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in saveRecordingMetadata:', error);
    return null;
  }
}

export async function getRecordingUrl(path: string): Promise<string | null> {
  try {
    const { data } = await supabase.storage
      .from('echobucket')
      .createSignedUrl(path, 3600); // 1 hour expiry

    return data?.signedUrl || null;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
}