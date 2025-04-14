/*
  # Final cleanup
  
  This migration:
  1. Ensures RLS is disabled on any remaining objects
  2. Removes any remaining policies
*/

BEGIN;

-- Disable RLS on storage.objects if enabled
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Clean up any remaining storage policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Authenticated users can upload recordings" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can read recordings" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own recordings" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own recordings" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

COMMIT;