/*
  # Add storage bucket and policies

  1. Storage
    - Create storage bucket 'echobucket'
    - Add storage bucket policies for authenticated users

  Note: Table and RLS policies for 'recordings' already exist from previous migration
*/

-- Create storage bucket for recordings if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name)
  VALUES ('echobucket', 'echobucket')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Enable RLS for storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage bucket policies
CREATE POLICY "Authenticated users can upload recordings"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'echobucket' AND
    (storage.foldername(name))[1] = 'recordings'
  );

CREATE POLICY "Authenticated users can read recordings"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'echobucket' AND
    (storage.foldername(name))[1] = 'recordings'
  );

CREATE POLICY "Users can update their own recordings"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'echobucket' AND
    (storage.foldername(name))[1] = 'recordings'
  );

CREATE POLICY "Users can delete their own recordings"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'echobucket' AND
    (storage.foldername(name))[1] = 'recordings'
  );