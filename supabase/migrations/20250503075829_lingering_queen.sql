/*
  # Fix RLS policies for samples table

  1. Security Updates
    - Drop and recreate RLS policies for samples table
    - Ensure proper user authentication checks
    - Add policies for all CRUD operations
*/

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can read own samples" ON samples;
  DROP POLICY IF EXISTS "Users can create samples" ON samples;
  DROP POLICY IF EXISTS "Users can update own samples" ON samples;
  DROP POLICY IF EXISTS "Users can delete own samples" ON samples;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Recreate policies with proper authentication checks
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

-- Ensure RLS is enabled
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;