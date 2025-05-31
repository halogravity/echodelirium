/*
  # Drop default_samples table
  
  Now that default samples are in the main samples table,
  we can remove the separate default_samples table
*/

-- Drop the view first since it depends on default_samples
DROP VIEW IF EXISTS all_samples;

-- Drop the default_samples table
DROP TABLE IF EXISTS default_samples;