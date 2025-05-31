/*
  # Clean Database Setup
  
  This migration provides a complete, clean setup for:
  1. Storage bucket for recordings
  2. Recordings table with metadata
  3. Presets table for saving effect settings
  4. All necessary RLS policies
  
  Note: This is a clean-slate migration that first removes any existing objects
  to avoid conflicts, then recreates everything in the correct order.
*/

BEGIN;

-- First clean up any existing objects
DROP TABLE IF EXISTS recordings CASCADE;
DROP TABLE IF EXISTS presets CASCADE;

-- Remove existing storage policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can upload recordings" ON storage.objects;
  DROP POLICY IF EXISTS "Users can read own recordings" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own recordings" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create or recreate storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('echobucket', 'echobucket', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create recordings table
CREATE TABLE recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recordings_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT recordings_storage_path_not_empty CHECK (length(trim(storage_path)) > 0)
);

-- Create presets table
CREATE TABLE presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parameters jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT presets_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT presets_parameters_not_null CHECK (parameters IS NOT NULL)
);

-- Enable RLS
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX recordings_user_id_idx ON recordings(user_id);
CREATE INDEX recordings_created_at_idx ON recordings(created_at DESC);
CREATE INDEX presets_user_id_idx ON presets(user_id);
CREATE INDEX presets_created_at_idx ON presets(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to recordings table
CREATE TRIGGER update_recordings_updated_at
  BEFORE UPDATE ON recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket policies
CREATE POLICY "Users can upload recordings" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'echobucket' AND
    (storage.foldername(name))[1] = 'recordings' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "Users can read own recordings" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'echobucket' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "Users can delete own recordings" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'echobucket' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

-- Recordings table policies
CREATE POLICY "Users can view their own recordings"
  ON recordings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recordings"
  ON recordings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recordings"
  ON recordings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recordings"
  ON recordings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Presets table policies
CREATE POLICY "Users can read own presets"
  ON presets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create presets"
  ON presets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presets"
  ON presets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own presets"
  ON presets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE recordings IS 'Stores metadata for user audio recordings';
COMMENT ON TABLE presets IS 'Stores user-saved effect parameter presets';
COMMENT ON COLUMN recordings.storage_path IS 'Path to the audio file in the storage bucket';
COMMENT ON COLUMN presets.parameters IS 'JSON object containing effect parameters and settings';

COMMIT;