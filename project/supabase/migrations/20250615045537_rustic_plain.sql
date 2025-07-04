/*
  # Add tarif_base column to installations table

  1. New Column
    - `tarif_base` (numeric, pricing in ct€/kWh)
      - Stores the base tariff for producer installations
      - Replaces the separate tarifs table approach

  2. Security
    - No RLS changes needed (installations table already has proper policies)
    - Maintains existing foreign key relationships

  3. Data Migration
    - Column allows NULL values for existing installations
    - New installations will include tarif_base value
*/

-- Add tarif_base column to installations table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'installations' AND column_name = 'tarif_base'
  ) THEN
    ALTER TABLE installations ADD COLUMN tarif_base numeric(10,2) CHECK (tarif_base >= 0);
    
    -- Add index for better performance on tarif queries
    CREATE INDEX IF NOT EXISTS idx_installations_tarif_base ON installations(tarif_base);
    
    -- Add comment for documentation
    COMMENT ON COLUMN installations.tarif_base IS 'Base tariff in ct€/kWh for energy sales';
  END IF;
END $$;