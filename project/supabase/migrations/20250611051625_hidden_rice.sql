/*
  # Fix UUID default values for primary key columns

  1. Changes
    - Add default UUID generation for `consommateurs.id` column
    - Add default UUID generation for `producteurs.id` column
    
  2. Security
    - No changes to existing RLS policies
    - Maintains all existing constraints and indexes
    
  This migration resolves the "null value in column 'id'" constraint violation
  by ensuring that UUID primary keys are automatically generated when not provided.
*/

-- Add default UUID generation for consommateurs table
ALTER TABLE public.consommateurs 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add default UUID generation for producteurs table  
ALTER TABLE public.producteurs 
ALTER COLUMN id SET DEFAULT gen_random_uuid();