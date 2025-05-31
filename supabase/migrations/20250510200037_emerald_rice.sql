/*
  # Add songs table for sequencer state

  1. New Tables
    - `songs`
      - `id` (uuid, primary key)
      - `name` (text)
      - `user_id` (uuid, references auth.users)
      - `bpm` (integer)
      - `swing` (float)
      - `tracks` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `songs` table
    - Add policies for authenticated users to manage their songs
*/

CREATE TABLE IF NOT EXISTS songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bpm integer NOT NULL CHECK (bpm >= 20 AND bpm <= 300),
  swing float NOT NULL CHECK (swing >= 0 AND swing <= 1),
  tracks jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT songs_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Enable RLS
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX songs_user_id_idx ON songs(user_id);
CREATE INDEX songs_created_at_idx ON songs(created_at DESC);

-- Create updated_at trigger
CREATE TRIGGER update_songs_updated_at
  BEFORE UPDATE ON songs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies
CREATE POLICY "Users can read own songs"
  ON songs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create songs"
  ON songs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own songs"
  ON songs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own songs"
  ON songs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);