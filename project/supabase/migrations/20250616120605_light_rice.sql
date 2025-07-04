/*
  # Fix installations table id column default value

  1. Problem
    - The `installations` table `id` column is missing a default value
    - This causes "null value in column 'id' violates not-null constraint" errors
    - Primary key should automatically generate UUIDs

  2. Solution
    - Add default value `gen_random_uuid()` to the `id` column
    - This will automatically generate UUIDs for new insertions

  3. Verification
    - Check that the default is properly set
    - Ensure existing data is not affected
*/

-- Add default value to installations.id column
ALTER TABLE installations ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verify the change was applied
DO $$
BEGIN
  -- Check if the default was set correctly
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'installations' 
    AND column_name = 'id' 
    AND column_default = 'gen_random_uuid()'
  ) THEN
    RAISE NOTICE 'SUCCESS: installations.id column now has gen_random_uuid() default';
  ELSE
    RAISE WARNING 'WARNING: Default value may not have been set correctly';
  END IF;
END $$;