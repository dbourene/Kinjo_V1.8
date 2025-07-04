/*
  # Add PRM column to consommateurs table

  1. New Column
    - `prm` (text, 14 digits)
      - Stores the consumer's PRM number for matching with nearby producers
      - Required for all consumers to enable location-based matching

  2. Security
    - No RLS changes needed (consommateurs table already has proper policies)
    - Maintains existing foreign key relationships

  3. Constraints
    - PRM must be exactly 14 digits
    - PRM must be unique across all consumers
*/

-- Add prm column to consommateurs table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'consommateurs' AND column_name = 'prm'
  ) THEN
    -- Add the prm column
    ALTER TABLE consommateurs ADD COLUMN prm text;
    
    -- Add constraint for 14-digit PRM format
    ALTER TABLE consommateurs ADD CONSTRAINT consommateurs_prm_check 
      CHECK (prm ~ '^\\d{14}$');
    
    -- Add unique constraint for PRM
    ALTER TABLE consommateurs ADD CONSTRAINT unique_prm 
      UNIQUE (prm);
    
    -- Add index for better performance on PRM queries
    CREATE INDEX IF NOT EXISTS idx_consommateurs_prm ON consommateurs(prm);
    
    -- Add comment for documentation
    COMMENT ON COLUMN consommateurs.prm IS 'Point de Référence et de Mesure (14 digits) for location-based producer matching';
  END IF;
END $$;