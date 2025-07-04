-- Add address and coordinates columns to consommateurs table if they don't exist
DO $$
BEGIN
  -- Add adresse column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'consommateurs' AND column_name = 'adresse'
  ) THEN
    ALTER TABLE consommateurs ADD COLUMN adresse text;
    COMMENT ON COLUMN consommateurs.adresse IS 'Full address of the consumer location';
  END IF;

  -- Add latitude column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'consommateurs' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE consommateurs ADD COLUMN latitude double precision;
    COMMENT ON COLUMN consommateurs.latitude IS 'GPS latitude coordinate for location-based matching';
  END IF;

  -- Add longitude column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'consommateurs' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE consommateurs ADD COLUMN longitude double precision;
    COMMENT ON COLUMN consommateurs.longitude IS 'GPS longitude coordinate for location-based matching';
  END IF;
END $$;

-- Add indexes for better performance on location-based queries
CREATE INDEX IF NOT EXISTS idx_consommateurs_location ON consommateurs(latitude, longitude);