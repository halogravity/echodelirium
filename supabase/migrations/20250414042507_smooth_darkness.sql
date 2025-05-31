-- Create presets table if it doesn't exist
CREATE TABLE IF NOT EXISTS presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  parameters jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read own presets" ON presets;
  DROP POLICY IF EXISTS "Users can create presets" ON presets;
  DROP POLICY IF EXISTS "Users can update own presets" ON presets;
  DROP POLICY IF EXISTS "Users can delete own presets" ON presets;
END $$;

-- Create policies
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