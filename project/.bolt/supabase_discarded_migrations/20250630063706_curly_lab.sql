/*
  # Add tarif_base column to consommateurs table

  1. New Column
    - `tarif_base` (numeric, pricing in ct€/kWh)
      - Stores the base tariff for consumer energy supply
      - Used for cost comparison and matching with producers

  2. Security
    - No RLS changes needed (consommateurs table already has proper policies)
    - Maintains existing foreign key relationships

  3. Data Migration
    - Column allows NULL values for existing consumers
    - New consumers will include tarif_base value
*/

-- Add tarif_base column to consommateurs table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'consommateurs' AND column_name = 'tarif_base'
  ) THEN
    ALTER TABLE consommateurs ADD COLUMN tarif_base numeric(10,2) CHECK (tarif_base >= 0);
    
    -- Add index for better performance on tarif queries
    CREATE INDEX IF NOT EXISTS idx_consommateurs_tarif_base ON consommateurs(tarif_base);
    
    -- Add comment for documentation
    COMMENT ON COLUMN consommateurs.tarif_base IS 'Base tariff in ct€/kWh for energy supply';
  END IF;
END $$;