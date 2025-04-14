/*
  # Create recordings table and storage bucket

  1. New Tables
    - `recordings`
      - `id` (uuid, primary key)
      - `name` (text)
      - `user_id` (uuid, references auth.users)
      - `storage_path` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `recordings` table
    - Add policies for authenticated users to manage their recordings
*/

-- Create recordings table
CREATE TABLE IF NOT EXISTS recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Create policies
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