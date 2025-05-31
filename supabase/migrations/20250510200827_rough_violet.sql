/*
  # Add trigger to set user_id on songs table

  1. Changes
    - Add trigger to automatically set user_id to current user's ID when creating songs
    - This ensures RLS policies work correctly for song creation

  2. Security
    - Maintains existing RLS policies
    - Ensures songs are always associated with the creating user
*/

CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_songs_user_id' 
  ) THEN
    CREATE TRIGGER set_songs_user_id
      BEFORE INSERT ON public.songs
      FOR EACH ROW
      EXECUTE FUNCTION public.set_user_id();
  END IF;
END $$;