/*
  # Add updated_at column to consommateurs table

  1. Changes
    - Add `updated_at` column to `consommateurs` table with default value
    - Create trigger to automatically update the column on row updates
    - Ensure consistency with `producteurs` table structure

  2. Security
    - No changes to existing RLS policies
    - Maintains existing table permissions
*/

-- Add updated_at column to consommateurs table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consommateurs' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.consommateurs ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create or replace the trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for consommateurs table to update updated_at on each row update
DROP TRIGGER IF EXISTS update_consommateurs_updated_at ON public.consommateurs;
CREATE TRIGGER update_consommateurs_updated_at
    BEFORE UPDATE ON public.consommateurs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure producteurs table also has the trigger (for consistency)
DROP TRIGGER IF EXISTS update_producteurs_updated_at ON public.producteurs;
CREATE TRIGGER update_producteurs_updated_at
    BEFORE UPDATE ON public.producteurs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();