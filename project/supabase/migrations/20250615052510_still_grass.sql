/*
  # Fix RLS policies for producteur user access

  1. Security Review
    - Ensure producteurs can read/write their own data
    - Ensure installations table has proper access for producteurs
    - Remove any conflicting or overly restrictive policies
    - Maintain security while allowing proper functionality

  2. Tables to Review
    - producteurs: User profile data
    - installations: Installation data with tarif_base
    - consommateurs: Consumer data (for reference)

  3. Policy Updates
    - Clean up existing policies
    - Add proper policies for all CRUD operations
    - Ensure service role access for system operations
*/

-- ============================================================================
-- PRODUCTEURS TABLE POLICIES
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Service role full access producteurs" ON producteurs;
DROP POLICY IF EXISTS "Users read own producteur data" ON producteurs;
DROP POLICY IF EXISTS "Users insert own producteur data" ON producteurs;
DROP POLICY IF EXISTS "Users update own producteur data" ON producteurs;
DROP POLICY IF EXISTS "Business operations read producteurs" ON producteurs;
DROP POLICY IF EXISTS "Allow signup insertion producteurs" ON producteurs;

-- Ensure RLS is enabled
ALTER TABLE producteurs ENABLE ROW LEVEL SECURITY;

-- 1. Service role can do everything (for admin operations and system processes)
CREATE POLICY "Service role full access producteurs"
  ON producteurs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Authenticated users can read their own producteur data
CREATE POLICY "Users read own producteur data"
  ON producteurs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Authenticated users can insert their own producteur data
CREATE POLICY "Users insert own producteur data"
  ON producteurs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. Authenticated users can update their own producteur data
CREATE POLICY "Users update own producteur data"
  ON producteurs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Allow reading producteur data for business operations (other authenticated users)
CREATE POLICY "Business operations read producteurs"
  ON producteurs
  FOR SELECT
  TO authenticated
  USING (true);

-- 6. Allow anon users to insert during signup process (needed for email confirmation flow)
CREATE POLICY "Allow signup insertion producteurs"
  ON producteurs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- ============================================================================
-- INSTALLATIONS TABLE POLICIES
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Service role full access installations" ON installations;
DROP POLICY IF EXISTS "Users can read own installations" ON installations;
DROP POLICY IF EXISTS "Users can insert own installations" ON installations;
DROP POLICY IF EXISTS "Users can update own installations" ON installations;
DROP POLICY IF EXISTS "Allow signup insertion installations" ON installations;

-- Ensure RLS is enabled
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;

-- 1. Service role can do everything (for admin operations and system processes)
CREATE POLICY "Service role full access installations"
  ON installations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Authenticated users can read their own installations
CREATE POLICY "Users can read own installations"
  ON installations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM producteurs p 
      WHERE p.id = installations.producteur_id 
      AND p.user_id = auth.uid()
    )
  );

-- 3. Authenticated users can insert their own installations
CREATE POLICY "Users can insert own installations"
  ON installations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM producteurs p 
      WHERE p.id = installations.producteur_id 
      AND p.user_id = auth.uid()
    )
  );

-- 4. Authenticated users can update their own installations
CREATE POLICY "Users can update own installations"
  ON installations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM producteurs p 
      WHERE p.id = installations.producteur_id 
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM producteurs p 
      WHERE p.id = installations.producteur_id 
      AND p.user_id = auth.uid()
    )
  );

-- 5. Allow anon users to insert during signup process (needed for email confirmation flow)
CREATE POLICY "Allow signup insertion installations"
  ON installations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 6. Allow authenticated users to insert installations during signup confirmation
-- This is needed because during email confirmation, the user is authenticated but
-- the foreign key relationships might not be fully established yet
CREATE POLICY "Allow signup installations insertion"
  ON installations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow insertion if the producteur exists and belongs to the current user
    -- and was created recently (within the last hour)
    EXISTS (
      SELECT 1 FROM producteurs p 
      WHERE p.id = installations.producteur_id 
      AND p.user_id = auth.uid()
      AND p.created_at > NOW() - INTERVAL '1 hour'
    )
  );

-- ============================================================================
-- CONSOMMATEURS TABLE POLICIES (for reference and consistency)
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Service role full access consommateurs" ON consommateurs;
DROP POLICY IF EXISTS "Users read own consommateur data" ON consommateurs;
DROP POLICY IF EXISTS "Users insert own consommateur data" ON consommateurs;
DROP POLICY IF EXISTS "Users update own consommateur data" ON consommateurs;
DROP POLICY IF EXISTS "Business operations read consommateurs" ON consommateurs;
DROP POLICY IF EXISTS "Allow signup insertion consommateurs" ON consommateurs;

-- Ensure RLS is enabled
ALTER TABLE consommateurs ENABLE ROW LEVEL SECURITY;

-- 1. Service role can do everything
CREATE POLICY "Service role full access consommateurs"
  ON consommateurs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Authenticated users can read their own consommateur data
CREATE POLICY "Users read own consommateur data"
  ON consommateurs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Authenticated users can insert their own consommateur data
CREATE POLICY "Users insert own consommateur data"
  ON consommateurs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. Authenticated users can update their own consommateur data
CREATE POLICY "Users update own consommateur data"
  ON consommateurs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Allow reading consommateur data for business operations
CREATE POLICY "Business operations read consommateurs"
  ON consommateurs
  FOR SELECT
  TO authenticated
  USING (true);

-- 6. Allow anon users to insert during signup process
CREATE POLICY "Allow signup insertion consommateurs"
  ON consommateurs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Ensure we have proper indexes for RLS policy performance
CREATE INDEX IF NOT EXISTS idx_producteurs_user_id ON producteurs(user_id);
CREATE INDEX IF NOT EXISTS idx_consommateurs_user_id ON consommateurs(user_id);
CREATE INDEX IF NOT EXISTS idx_installations_producteur_id ON installations(producteur_id);
CREATE INDEX IF NOT EXISTS idx_installations_tarif_base ON installations(tarif_base);

-- Email indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_producteurs_email ON producteurs(contact_email);
CREATE INDEX IF NOT EXISTS idx_consommateurs_email ON consommateurs(contact_email);

-- ============================================================================
-- VERIFICATION QUERIES (for debugging)
-- ============================================================================

-- These comments show how to verify the policies are working:
-- 
-- 1. Check if a user can read their own producteur data:
-- SELECT * FROM producteurs WHERE user_id = auth.uid();
--
-- 2. Check if a user can read their own installations:
-- SELECT i.* FROM installations i 
-- JOIN producteurs p ON p.id = i.producteur_id 
-- WHERE p.user_id = auth.uid();
--
-- 3. Verify RLS is enabled:
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename IN ('producteurs', 'installations', 'consommateurs');
--
-- 4. List all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename IN ('producteurs', 'installations', 'consommateurs')
-- ORDER BY tablename, policyname;