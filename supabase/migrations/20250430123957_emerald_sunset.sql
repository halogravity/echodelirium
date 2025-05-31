/*
  # Add samples table
  
  1. New Tables
    - `samples`
      - `id` (uuid, primary key)
      - `name` (text)
      - `user_id` (uuid, references auth.users)
      - `storage_path` (text)
      - `type` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `samples` table
    - Add policies for authenticated users to manage their samples
*/

CREATE TABLE IF NOT EXISTS samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT samples_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT samples_storage_path_not_empty CHECK (length(trim(storage_path)) > 0)
);

-- Enable RLS
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX samples_user_id_idx ON samples(user_id);
CREATE INDEX samples_type_idx ON samples(type);
CREATE INDEX samples_created_at_idx ON samples(created_at DESC);

-- Create policies
CREATE POLICY "Users can read own samples"
  ON samples
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create samples"
  ON samples
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own samples"
  ON samples
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own samples"
  ON samples
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Storage bucket policies for samples
CREATE POLICY "Users can upload samples" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'echobucket' AND
    (storage.foldername(name))[1] = 'samples' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "Users can read own samples" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'echobucket' AND
    (storage.foldername(name))[1] = 'samples' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "Users can delete own samples" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'echobucket' AND
    (storage.foldername(name))[1] = 'samples' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );