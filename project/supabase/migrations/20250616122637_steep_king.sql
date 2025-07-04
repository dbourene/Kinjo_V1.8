/*
  # Remove PRM column from producteurs table

  1. Changes
    - Remove prm column from producteurs table since PRM is now stored in installations table
    - Remove related constraints and indexes for PRM in producteurs table

  2. Security
    - No changes to RLS policies
    - Maintains all existing foreign key relationships
*/

-- Remove PRM-related constraints and indexes from producteurs table
DROP INDEX IF EXISTS producteurs_prm_key;
ALTER TABLE producteurs DROP CONSTRAINT IF EXISTS producteurs_prm_check;
ALTER TABLE producteurs DROP CONSTRAINT IF EXISTS producteurs_prm_key;

-- Remove the prm column from producteurs table
ALTER TABLE producteurs DROP COLUMN IF EXISTS prm;

-- Add comment for documentation
COMMENT ON TABLE producteurs IS 'Producer profiles - PRM numbers are now stored in installations table';