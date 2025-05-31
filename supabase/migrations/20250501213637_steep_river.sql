/*
  # Add default samples to database
  
  1. Create a system samples approach
    - Create a special policy for public samples
    - Use a different approach that doesn't require a user_id
    - Store default sample paths in the database
*/

-- Create a special table for default samples that doesn't require user_id
CREATE TABLE IF NOT EXISTS default_samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  storage_path text NOT NULL,
  type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT default_samples_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT default_samples_storage_path_not_empty CHECK (length(trim(storage_path)) > 0)
);

-- Insert default samples
INSERT INTO default_samples (name, storage_path, type, created_at)
VALUES 
  ('Kick', '/samples/kick.wav', 'kick', now()),
  ('Snare', '/samples/snare.wav', 'snare', now()),
  ('Hi-hat', '/samples/hihat.wav', 'hihat', now()),
  ('Bass', '/samples/bass.wav', 'bass', now()),
  ('Sub', '/samples/sub.wav', 'sub', now())
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow all users to read default samples
ALTER TABLE default_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read default samples"
  ON default_samples
  FOR SELECT
  TO authenticated
  USING (true);

-- Create a view that combines user samples and default samples
CREATE OR REPLACE VIEW all_samples AS
  SELECT 
    id, 
    name, 
    user_id, 
    storage_path, 
    type, 
    created_at,
    'user' as source
  FROM samples
  UNION ALL
  SELECT 
    id, 
    name, 
    NULL as user_id, 
    storage_path, 
    type, 
    created_at,
    'default' as source
  FROM default_samples;

-- Create index on default_samples
CREATE INDEX IF NOT EXISTS default_samples_type_idx ON default_samples(type);