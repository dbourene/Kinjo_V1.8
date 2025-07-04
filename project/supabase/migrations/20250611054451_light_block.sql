/*
  # Fix phone number check constraint

  1. Changes
    - Drop the existing restrictive phone constraint that requires 8-15 digits
    - Add a new constraint that allows 1-15 digits after the '+' sign
    - This aligns with the E.164 international phone number standard
    - Apply the same fix to both consommateurs and producteurs tables

  2. Security
    - Maintains data validation while being more flexible
    - Ensures phone numbers still follow international format
*/

-- Fix consommateurs table phone constraint
ALTER TABLE public.consommateurs 
DROP CONSTRAINT IF EXISTS consommateurs_contact_telephone_check;

ALTER TABLE public.consommateurs 
ADD CONSTRAINT consommateurs_contact_telephone_check 
CHECK (contact_telephone ~ '^\+\d{1,15}$'::text);

-- Fix producteurs table phone constraint  
ALTER TABLE public.producteurs 
DROP CONSTRAINT IF EXISTS producteurs_contact_telephone_check;

ALTER TABLE public.producteurs 
ADD CONSTRAINT producteurs_contact_telephone_check 
CHECK (contact_telephone ~ '^\+\d{1,15}$'::text);

-- Also update the duplicate constraint names to be consistent
ALTER TABLE public.consommateurs 
DROP CONSTRAINT IF EXISTS contacttelephone_format_check;

ALTER TABLE public.producteurs 
DROP CONSTRAINT IF EXISTS contacttelephone_format_check;