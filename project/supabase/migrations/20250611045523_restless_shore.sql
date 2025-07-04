/*
  # Fix RLS policies for direct user registration

  1. Issues Fixed
    - Allow service role to perform all operations during registration
    - Add policies for unauthenticated users during signup process
    - Ensure proper permissions for direct account creation

  2. Changes
    - Add service role policies for both tables
    - Add temporary policies for signup process
    - Ensure RLS doesn't block legitimate operations
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own consommateur data" ON consommateurs;
DROP POLICY IF EXISTS "Users can insert own consommateur data" ON consommateurs;
DROP POLICY IF EXISTS "Users can update own consommateur data" ON consommateurs;
DROP POLICY IF EXISTS "Service role can manage all consommateur data" ON consommateurs;
DROP POLICY IF EXISTS "Allow reading for business operations" ON consommateurs;

DROP POLICY IF EXISTS "Users can read own producteur data" ON producteurs;
DROP POLICY IF EXISTS "Users can insert own producteur data" ON producteurs;
DROP POLICY IF EXISTS "Users can update own producteur data" ON producteurs;
DROP POLICY IF EXISTS "Service role can manage all producteur data" ON producteurs;
DROP POLICY IF EXISTS "Allow reading producteur for business operations" ON producteurs;

-- Ensure RLS is enabled
ALTER TABLE consommateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE producteurs ENABLE ROW LEVEL SECURITY;

-- CONSOMMATEURS POLICIES

-- 1. Service role can do everything (for admin operations and system processes)
CREATE POLICY "Service role full access consommateurs"
  ON consommateurs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Authenticated users can read their own data
CREATE POLICY "Users read own consommateur data"
  ON consommateurs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Authenticated users can insert their own data
CREATE POLICY "Users insert own consommateur data"
  ON consommateurs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. Authenticated users can update their own data
CREATE POLICY "Users update own consommateur data"
  ON consommateurs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Allow reading for business operations (other authenticated users)
CREATE POLICY "Business operations read consommateurs"
  ON consommateurs
  FOR SELECT
  TO authenticated
  USING (true);

-- 6. CRITICAL: Allow anon users to insert during signup process
-- This is needed when the user is created but session isn't fully established yet
CREATE POLICY "Allow signup insertion consommateurs"
  ON consommateurs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- PRODUCTEURS POLICIES (identical structure)

-- 1. Service role can do everything
CREATE POLICY "Service role full access producteurs"
  ON producteurs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Authenticated users can read their own data
CREATE POLICY "Users read own producteur data"
  ON producteurs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Authenticated users can insert their own data
CREATE POLICY "Users insert own producteur data"
  ON producteurs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. Authenticated users can update their own data
CREATE POLICY "Users update own producteur data"
  ON producteurs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Allow reading for business operations
CREATE POLICY "Business operations read producteurs"
  ON producteurs
  FOR SELECT
  TO authenticated
  USING (true);

-- 6. CRITICAL: Allow anon users to insert during signup process
CREATE POLICY "Allow signup insertion producteurs"
  ON producteurs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consommateurs_user_id ON consommateurs(user_id);
CREATE INDEX IF NOT EXISTS idx_producteurs_user_id ON producteurs(user_id);
CREATE INDEX IF NOT EXISTS idx_consommateurs_email ON consommateurs(contact_email);
CREATE INDEX IF NOT EXISTS idx_producteurs_email ON producteurs(contact_email);