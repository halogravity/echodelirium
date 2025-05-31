/*
  # Database Setup with Policy Cleanup
  
  This migration:
  1. Drops existing policies to avoid conflicts
  2. Creates storage bucket
  3. Creates tables and enables RLS
  4. Sets up new policies
*/

BEGIN;

-- Drop existing policies if they exist
DO $$
BEGIN
  -- Drop storage policies
  DROP POLICY IF EXISTS "Users can upload recordings" ON storage.objects;
  DROP POLICY IF EXISTS "Users can read own recordings" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own recordings" ON storage.objects;
  
  -- Drop recordings policies
  DROP POLICY IF EXISTS "Users can view their own recordings" ON recordings;
  DROP POLICY IF EXISTS "Users can insert their own recordings" ON recordings;
  DROP POLICY IF EXISTS "Users can update their own recordings" ON recordings;
  DROP POLICY IF EXISTS "Users can delete their own recordings" ON recordings;
  
  -- Drop presets policies
  DROP POLICY IF EXISTS "Users can read own presets" ON presets;
  DROP POLICY IF EXISTS "Users can create presets" ON presets;
  DROP POLICY IF EXISTS "Users can update own presets" ON presets;
  DROP POLICY IF EXISTS "Users can delete own presets" ON presets;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create storage bucket
INSERT INTO storage.buckets (id, name)
VALUES ('echobucket', 'echobucket')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create recordings table
CREATE TABLE IF NOT EXISTS recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on recordings
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Create presets table
CREATE TABLE IF NOT EXISTS presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  parameters jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on presets
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

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

COMMIT;