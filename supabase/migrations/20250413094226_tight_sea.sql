/*
  # Add Storage and Recordings Policies

  1. Storage Policies
    - Enable storage bucket RLS
    - Add policies for authenticated users to:
      - Upload recordings to their own folder
      - Read their own recordings
      - Delete their own recordings

  2. Table Policies
    - Add policies for recordings table to allow:
      - Insert with user_id matching authenticated user
      - Select own recordings
      - Update own recordings
      - Delete own recordings
*/

-- Enable RLS for storage bucket
BEGIN;

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('echobucket', 'echobucket')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies
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

-- Add RLS policies for recordings table
CREATE POLICY "Users can insert own recordings"
  ON public.recordings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own recordings"
  ON public.recordings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recordings"
  ON public.recordings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings"
  ON public.recordings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

COMMIT;