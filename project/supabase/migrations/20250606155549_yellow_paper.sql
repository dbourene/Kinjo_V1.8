/*
  # Update Supabase Auth settings for email confirmation

  1. Configuration
    - Set custom redirect URL for email confirmation
    - Configure site URL for proper redirects

  2. Notes
    - This migration updates auth settings to redirect to our custom confirmation page
    - The redirect URL will be: http://localhost:5173/confirm
*/

-- Note: These settings are typically configured in the Supabase dashboard
-- Auth > URL Configuration section
-- 
-- Site URL: http://localhost:5173
-- Redirect URLs: http://localhost:5173/confirm
--
-- For production, update these URLs accordingly