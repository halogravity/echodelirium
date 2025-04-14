/*
  # Rollback storage policies and recordings table policies
  
  This migration safely removes:
  1. Storage bucket policies for recordings
  2. Recordings table policies
  3. Storage bucket RLS
*/

BEGIN;

-- First remove storage policies if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can upload recordings" ON storage.objects;
    DROP POLICY IF EXISTS "Users can read own recordings" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete own recordings" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Remove recordings table policies if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can insert own recordings" ON public.recordings;
    DROP POLICY IF EXISTS "Users can read own recordings" ON public.recordings;
    DROP POLICY IF EXISTS "Users can update own recordings" ON public.recordings;
    DROP POLICY IF EXISTS "Users can delete own recordings" ON public.recordings;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Disable RLS on storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

COMMIT;