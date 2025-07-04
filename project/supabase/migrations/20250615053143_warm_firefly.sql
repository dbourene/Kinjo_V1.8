/*
  # Restore working version from yesterday
  
  1. Remove the problematic tarifs table that was added this morning
  2. Ensure installations table has tarif_base column (it already exists)
  3. Restore simple, working RLS policies
  4. Clean up any conflicting policies
  
  This restores the working state from yesterday where:
  - Producteurs data goes to public.producteurs table
  - Installation data (including tarif_base) goes to public.installations table
  - Both linked by user_id foreign key
*/

-- ============================================================================
-- CLEAN UP: Remove the problematic tarifs table added this morning
-- ============================================================================

-- Drop the tarifs table that was causing issues
DROP TABLE IF EXISTS tarifs CASCADE;

-- ============================================================================
-- ENSURE INSTALLATIONS TABLE HAS TARIF_BASE COLUMN
-- ============================================================================

-- The tarif_base column should already exist in installations table
-- This is just to make sure it's there with proper constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'installations' AND column_name = 'tarif_base'
  ) THEN
    ALTER TABLE installations ADD COLUMN tarif_base numeric(10,2) CHECK (tarif_base >= 0);
    CREATE INDEX IF NOT EXISTS idx_installations_tarif_base ON installations(tarif_base);
    COMMENT ON COLUMN installations.tarif_base IS 'Base tariff in ct€/kWh for energy sales';
  END IF;
END $$;

-- ============================================================================
-- RESTORE SIMPLE, WORKING RLS POLICIES
-- ============================================================================

-- Clean up all existing policies first
DROP POLICY IF EXISTS "Service role full access producteurs" ON producteurs;
DROP POLICY IF EXISTS "Users read own producteur data" ON producteurs;
DROP POLICY IF EXISTS "Users insert own producteur data" ON producteurs;
DROP POLICY IF EXISTS "Users update own producteur data" ON producteurs;
DROP POLICY IF EXISTS "Business operations read producteurs" ON producteurs;
DROP POLICY IF EXISTS "Allow signup insertion producteurs" ON producteurs;

DROP POLICY IF EXISTS "Service role full access installations" ON installations;
DROP POLICY IF EXISTS "Users can read own installations" ON installations;
DROP POLICY IF EXISTS "Users can insert own installations" ON installations;
DROP POLICY IF EXISTS "Users can update own installations" ON installations;
DROP POLICY IF EXISTS "Allow signup insertion installations" ON installations;
DROP POLICY IF EXISTS "Allow signup installations insertion" ON installations;

DROP POLICY IF EXISTS "Service role full access consommateurs" ON consommateurs;
DROP POLICY IF EXISTS "Users read own consommateur data" ON consommateurs;
DROP POLICY IF EXISTS "Users insert own consommateur data" ON consommateurs;
DROP POLICY IF EXISTS "Users update own consommateur data" ON consommateurs;
DROP POLICY IF EXISTS "Business operations read consommateurs" ON consommateurs;
DROP POLICY IF EXISTS "Allow signup insertion consommateurs" ON consommateurs;

-- ============================================================================
-- PRODUCTEURS TABLE - SIMPLE WORKING POLICIES
-- ============================================================================

ALTER TABLE producteurs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access producteurs"
  ON producteurs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can read their own data
CREATE POLICY "Users read own producteur data"
  ON producteurs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "Users insert own producteur data"
  ON producteurs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "Users update own producteur data"
  ON producteurs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow reading for business operations
CREATE POLICY "Business operations read producteurs"
  ON producteurs
  FOR SELECT
  TO authenticated
  USING (true);

-- CRITICAL: Allow anon insertion during signup
CREATE POLICY "Allow signup insertion producteurs"
  ON producteurs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- ============================================================================
-- INSTALLATIONS TABLE - SIMPLE WORKING POLICIES
-- ============================================================================

ALTER TABLE installations ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access installations"
  ON installations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can read their own installations
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

-- Users can insert their own installations
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

-- Users can update their own installations
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

-- CRITICAL: Allow anon insertion during signup
CREATE POLICY "Allow signup insertion installations"
  ON installations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated insertion during signup confirmation
CREATE POLICY "Allow signup installations insertion"
  ON installations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM producteurs p 
      WHERE p.id = installations.producteur_id 
      AND p.user_id = auth.uid()
      AND p.created_at > NOW() - INTERVAL '1 hour'
    )
  );

-- ============================================================================
-- CONSOMMATEURS TABLE - SIMPLE WORKING POLICIES
-- ============================================================================

ALTER TABLE consommateurs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access consommateurs"
  ON consommateurs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can read their own data
CREATE POLICY "Users read own consommateur data"
  ON consommateurs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "Users insert own consommateur data"
  ON consommateurs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "Users update own consommateur data"
  ON consommateurs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow reading for business operations
CREATE POLICY "Business operations read consommateurs"
  ON consommateurs
  FOR SELECT
  TO authenticated
  USING (true);

-- CRITICAL: Allow anon insertion during signup
CREATE POLICY "Allow signup insertion consommateurs"
  ON consommateurs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_producteurs_user_id ON producteurs(user_id);
CREATE INDEX IF NOT EXISTS idx_consommateurs_user_id ON consommateurs(user_id);
CREATE INDEX IF NOT EXISTS idx_installations_producteur_id ON installations(producteur_id);
CREATE INDEX IF NOT EXISTS idx_installations_tarif_base ON installations(tarif_base);
CREATE INDEX IF NOT EXISTS idx_producteurs_email ON producteurs(contact_email);
CREATE INDEX IF NOT EXISTS idx_consommateurs_email ON consommateurs(contact_email);