/*
  # Add address and coordinates to installations table

  1. New Columns
    - `adresse` (text): Full address of the installation
    - `latitude` (double precision): GPS latitude coordinate  
    - `longitude` (double precision): GPS longitude coordinate

  2. Security
    - No changes to existing RLS policies
    - Maintains all existing constraints and indexes

  3. Purpose
    - Store specific installation address (may differ from producer address)
    - Enable precise location-based matching
    - Support coordinate transformation from Lambert 93 to WGS84
*/

-- Add address and coordinates columns to installations table if they don't exist
DO $$
BEGIN
  -- Add adresse column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'installations' AND column_name = 'adresse'
  ) THEN
    ALTER TABLE installations ADD COLUMN adresse text;
    COMMENT ON COLUMN installations.adresse IS 'Full address of the specific installation';
  END IF;

  -- Add latitude column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'installations' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE installations ADD COLUMN latitude double precision;
    COMMENT ON COLUMN installations.latitude IS 'GPS latitude coordinate of the installation';
  END IF;

  -- Add longitude column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'installations' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE installations ADD COLUMN longitude double precision;
    COMMENT ON COLUMN installations.longitude IS 'GPS longitude coordinate of the installation';
  END IF;
END $$;

-- Add indexes for better performance on location-based queries
CREATE INDEX IF NOT EXISTS idx_installations_location ON installations(latitude, longitude);