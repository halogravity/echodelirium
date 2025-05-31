/*
  # Create default_samples table

  1. New Tables
    - `default_samples`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `storage_path` (text, not null)
      - `type` (text, not null)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `default_samples` table
    - Add policy for authenticated users to read default samples
    - No insert/update/delete policies since this is a read-only table for default samples

  3. Constraints
    - Name and storage path must not be empty
*/

CREATE TABLE IF NOT EXISTS default_samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  storage_path text NOT NULL,
  type text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT default_samples_name_not_empty CHECK (length(TRIM(BOTH FROM name)) > 0),
  CONSTRAINT default_samples_storage_path_not_empty CHECK (length(TRIM(BOTH FROM storage_path)) > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS default_samples_created_at_idx ON default_samples (created_at DESC);
CREATE INDEX IF NOT EXISTS default_samples_type_idx ON default_samples USING btree (type);

-- Enable RLS
ALTER TABLE default_samples ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for reading default samples
CREATE POLICY "Anyone can read default samples"
  ON default_samples
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert some default samples
INSERT INTO default_samples (name, storage_path, type, created_at) VALUES
  ('Kick', 'kick.wav', 'drum', now()),
  ('Snare', 'snare.wav', 'drum', now()),
  ('Hi-Hat', 'hihat.wav', 'drum', now()),
  ('Bass', 'bass.wav', 'bass', now()),
  ('Sub', 'sub.wav', 'bass', now())
ON CONFLICT (id) DO NOTHING;