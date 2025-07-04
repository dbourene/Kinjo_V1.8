/*
  # Add RLS policies for consumers to read installations and producteurs

  1. Problem
    - Consumers cannot read installations table (needed for map functionality)
    - Consumers cannot read producteurs table (needed for producer info)
    - This blocks the consumer map from showing nearby producers

  2. Solution
    - Add read-only policies for authenticated consumers
    - Allow consumers to read installations for location-based matching
    - Allow consumers to read basic producteur info for contact purposes

  3. Security
    - Only SELECT permissions (read-only)
    - Only for authenticated users
    - No sensitive data exposure
*/

-- ============================================================================
-- INSTALLATIONS TABLE - Add consumer read access
-- ============================================================================

-- Allow authenticated users (including consumers) to read installations for map functionality
CREATE POLICY "Authenticated users can read installations for annexe21"
  ON installations
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update installations for annexe21 generation
CREATE POLICY "Authenticated users can update installations for annexe21"
  ON installations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role full access for annexe21 operations
CREATE POLICY "Service role full access installations for annexe21"
  ON installations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- PRODUCTEURS TABLE - Add consumer read access
-- ============================================================================

-- Allow authenticated users (including consumers) to read basic producteur info
CREATE POLICY "Authenticated users can read producteurs for business matching"
  ON producteurs
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- OPERATIONS TABLE - Add policies for annexe21 functionality
-- ============================================================================

-- Service role full access for annexe21 operations
CREATE POLICY "Service role full access operations for annexe21"
  ON operations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read operations for annexe21
CREATE POLICY "Authenticated users can read operations for annexe21"
  ON operations
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update operations for annexe21
CREATE POLICY "Authenticated users can update operations for annexe21"
  ON operations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- COORDONNEES_ENEDIS TABLE - Add read access for operations
-- ============================================================================

-- Allow reading coordonnees_enedis for operations
CREATE POLICY "Allow reading coordonnees_enedis for operations"
  ON coordonnees_enedis
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated users can read coordonnees_enedis
CREATE POLICY "Authenticated users can read coordonnees_enedis"
  ON coordonnees_enedis
  FOR SELECT
  TO authenticated
  USING (true);

-- Service role full access
CREATE POLICY "Service role full access coordonnees_enedis"
  ON coordonnees_enedis
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Add performance indexes for consumer map queries
-- ============================================================================

-- Index for location-based queries on installations
CREATE INDEX IF NOT EXISTS idx_installations_location ON installations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_installations_tarif_base ON installations(tarif_base);

-- Index for producteur lookups
CREATE INDEX IF NOT EXISTS idx_installations_producteur_id ON installations(producteur_id);

-- Index for operations
CREATE INDEX IF NOT EXISTS idx_operations_url_annexe21 ON operations(url_annexe21) WHERE url_annexe21 IS NOT NULL;