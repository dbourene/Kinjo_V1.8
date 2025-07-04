/*
  # Add tarif_base column to installations table

  1. Changes
    - Add tarif_base column to installations table
    - Set appropriate data type and constraints
    - Add index for performance

  2. Security
    - No changes to existing RLS policies
    - Maintains all existing constraints
*/

-- Add tarif_base column to installations table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'installations' AND column_name = 'tarif_base'
  ) THEN
    ALTER TABLE installations ADD COLUMN tarif_base numeric(5,2) CHECK (tarif_base >= 0);
  END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_installations_tarif_base ON installations(tarif_base);

-- Add comment for documentation
COMMENT ON COLUMN installations.tarif_base IS 'Tarif de base en centimes d''euro par kWh pour la vente d''énergie';