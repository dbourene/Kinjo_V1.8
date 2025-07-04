/*
  # Fix phone number constraints for international format

  1. Changes
    - Update phone number check constraints for both producteurs and consommateurs tables
    - Support proper E.164 international format: +[country code][subscriber number]
    - Allow 7-15 digits total (excluding the + sign) as per ITU-T E.164 standard
    - Country codes can be 1-3 digits, subscriber numbers vary by country

  2. Security
    - Maintains data validation while supporting international formats
    - Ensures phone numbers start with + and contain only digits after
*/

-- Drop existing phone constraints
ALTER TABLE consommateurs DROP CONSTRAINT IF EXISTS consommateurs_contact_telephone_check;
ALTER TABLE producteurs DROP CONSTRAINT IF EXISTS producteurs_contact_telephone_check;

-- Add new phone constraints that support proper E.164 international format
-- Format: +[1-3 digit country code][4-12 digit subscriber number] = total 7-15 digits after +
ALTER TABLE consommateurs ADD CONSTRAINT consommateurs_contact_telephone_check 
  CHECK ((contact_telephone IS NULL) OR (contact_telephone ~ '^\+[1-9]\d{6,14}$'));

ALTER TABLE producteurs ADD CONSTRAINT producteurs_contact_telephone_check 
  CHECK ((contact_telephone IS NULL) OR (contact_telephone ~ '^\+[1-9]\d{6,14}$'));