/*
  # Fix phone number format constraint for international numbers

  1. Changes
    - Remove restrictive phone format check constraint from `consommateurs` table
    - Remove restrictive phone format check constraint from `producteurs` table
    - Add new constraint allowing international phone format (starting with + followed by digits)

  2. Security
    - Maintains data validation while allowing international phone numbers
    - Prevents empty or invalid phone number formats

  3. Impact
    - Allows registration with international phone numbers
    - Fixes the current registration error for consommateurs and producteurs
*/

-- Remove existing restrictive phone format constraints
ALTER TABLE public.consommateurs 
DROP CONSTRAINT IF EXISTS contacttelephone_format_check;

ALTER TABLE public.producteurs 
DROP CONSTRAINT IF EXISTS contacttelephone_format_check;

-- Add new constraint allowing international phone format
-- This allows phone numbers starting with + followed by digits (e.g., +33612345678)
ALTER TABLE public.consommateurs 
ADD CONSTRAINT contacttelephone_format_check 
CHECK (contact_telephone IS NULL OR contact_telephone ~ '^\+\d{8,15}$');

ALTER TABLE public.producteurs 
ADD CONSTRAINT contacttelephone_format_check 
CHECK (contact_telephone IS NULL OR contact_telephone ~ '^\+\d{8,15}$');