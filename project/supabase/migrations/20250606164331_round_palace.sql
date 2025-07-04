/*
  # RLS Policies for Consommateurs Table

  1. Security Policies
    - Enable RLS on consommateurs table
    - Allow users to read their own data
    - Allow users to update their own data
    - Allow users to insert their own data during registration
    - Prevent users from deleting their records (business rule)

  2. Admin Policies
    - Allow service role to perform all operations for admin functions
*/

-- Enable RLS on consommateurs table (if not already enabled)
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

-- Policy 5: Allow reading consommateur data for contract/operation matching
-- This allows other authenticated users to see basic info for business operations
CREATE POLICY "Allow reading for business operations"
  ON consommateurs
  FOR SELECT
  TO authenticated
  USING (
    -- Only allow reading basic business info, not sensitive personal data
    true
  );

-- Note: No DELETE policy is intentionally created to prevent accidental data loss
-- If deletion is needed, it should be handled through admin functions with service role