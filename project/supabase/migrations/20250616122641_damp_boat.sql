/*
  # Add address and coordinates to producteurs table

  1. New Columns
    - `adresse` (text): Full address of the producer/installation
    - `latitude` (double precision): GPS latitude coordinate
    - `longitude` (double precision): GPS longitude coordinate

  2. Security
    - No changes to existing RLS policies
    - Maintains all existing constraints and indexes

  3. Purpose
    - Store installation address for producers
    - Enable location-based matching between producers and consumers
    - Support coordinate transformation from Lambert 93 to WGS84
*/

-- Add address and coordinates columns to producteurs table if they don't exist
DO $$
BEGIN
  -- Add adresse column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'producteurs' AND column_name = 'adresse'
  ) THEN
    ALTER TABLE producteurs ADD COLUMN adresse text;
    COMMENT ON COLUMN producteurs.adresse IS 'Full address of the producer installation';
  END IF;

  -- Add latitude column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'producteurs' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE producteurs ADD COLUMN latitude double precision;
    COMMENT ON COLUMN producteurs.latitude IS 'GPS latitude coordinate for location-based matching';
  END IF;

  -- Add longitude column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'producteurs' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE producteurs ADD COLUMN longitude double precision;
    COMMENT ON COLUMN producteurs.longitude IS 'GPS longitude coordinate for location-based matching';
  END IF;
END $$;

-- Add indexes for better performance on location-based queries
CREATE INDEX IF NOT EXISTS idx_producteurs_location ON producteurs(latitude, longitude);