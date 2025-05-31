/*
  # Remove storage bucket and objects
  
  This migration:
  1. Removes all objects from the storage bucket
  2. Removes the storage bucket itself
*/

BEGIN;

-- First delete all objects in the bucket
DO $$
BEGIN
    DELETE FROM storage.objects 
    WHERE bucket_id = 'echobucket';
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Then delete the bucket
DO $$
BEGIN
    DELETE FROM storage.buckets 
    WHERE id = 'echobucket';
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

COMMIT;