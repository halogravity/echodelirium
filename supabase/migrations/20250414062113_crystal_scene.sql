/*
  # Rollback presets table and policies
  
  This migration safely removes:
  1. Presets table if it exists
  2. Associated policies
*/

BEGIN;

-- Check if table exists before attempting to drop policies
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'presets'
  ) THEN
    -- Drop policies if table exists
    DROP POLICY IF EXISTS "Users can read own presets" ON presets;
    DROP POLICY IF EXISTS "Users can create presets" ON presets;
    DROP POLICY IF EXISTS "Users can update own presets" ON presets;
    DROP POLICY IF EXISTS "Users can delete own presets" ON presets;
  END IF;
END $$;

-- Drop the table if it exists
DROP TABLE IF EXISTS presets;

COMMIT;