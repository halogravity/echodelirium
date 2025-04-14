/*
  # Rollback recordings table
  
  This migration:
  1. Removes policies from recordings table
  2. Drops the recordings table
*/

BEGIN;

-- First remove policies if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their own recordings" ON recordings;
    DROP POLICY IF EXISTS "Users can insert their own recordings" ON recordings;
    DROP POLICY IF EXISTS "Users can update their own recordings" ON recordings;
    DROP POLICY IF EXISTS "Users can delete their own recordings" ON recordings;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Drop the recordings table
DROP TABLE IF EXISTS recordings;

COMMIT;