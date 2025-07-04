/*
  # Fix RLS policies for consommateurs table

  1. Security Issues
    - Remove duplicate policies that may cause conflicts
    - Ensure proper RLS policies for email confirmation flow
    - Add missing policies for user registration

  2. Policy Updates
    - Clean up existing policies
    - Add proper policies for signup flow
    - Ensure service role access for system operations
*/

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own consommateur data" ON consommateurs;
DROP POLICY IF EXISTS "Users can insert own consommateur data" ON consommateurs;
DROP POLICY IF EXISTS "Users can update own consommateur data" ON consommateurs;
DROP POLICY IF EXISTS "Service role can manage all consommateur data" ON consommateurs;
DROP POLICY IF EXISTS "Allow reading for business operations" ON consommateurs;

-- Ensure RLS is enabled
ALTER TABLE consommateurs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own consommateur data
CREATE POLICY "Users can read own consommateur data"
  ON consommateurs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own consommateur data during registration
CREATE POLICY "Users can insert own consommateur data"
  ON consommateurs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own consommateur data
CREATE POLICY "Users can update own consommateur data"
  ON consommateurs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Service role can perform all operations (for admin functions)
CREATE POLICY "Service role can manage all consommateur data"
  ON consommateurs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 5: Allow reading consommateur data for business operations
CREATE POLICY "Allow reading for business operations"
  ON consommateurs
  FOR SELECT
  TO authenticated
  USING (true);

-- Also ensure producteurs table has similar policies
DROP POLICY IF EXISTS "Users can read own producteur data" ON producteurs;
DROP POLICY IF EXISTS "Users can insert own producteur data" ON producteurs;
DROP POLICY IF EXISTS "Users can update own producteur data" ON producteurs;
DROP POLICY IF EXISTS "Service role can manage all producteur data" ON producteurs;
DROP POLICY IF EXISTS "Allow reading producteur for business operations" ON producteurs;

-- Enable RLS on producteurs table
ALTER TABLE producteurs ENABLE ROW LEVEL SECURITY;

-- Producteur policies
CREATE POLICY "Users can read own producteur data"
  ON producteurs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own producteur data"
  ON producteurs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own producteur data"
  ON producteurs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all producteur data"
  ON producteurs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow reading producteur for business operations"
  ON producteurs
  FOR SELECT
  TO authenticated
  USING (true);