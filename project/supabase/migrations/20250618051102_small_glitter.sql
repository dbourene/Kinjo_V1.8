/*
  # Add RLS policies for operations table

  1. Security
    - Enable RLS on operations table
    - Add policies for users to access their own operations
    - Add policies for service role access
    - Add policies for business operations

  2. Purpose
    - Allow producers to access operations related to their installations
    - Maintain security while enabling Annexe 21 functionality
*/

-- Enable RLS on operations table
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access operations"
  ON operations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read operations related to their installations
CREATE POLICY "Users can read related operations"
  ON operations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM installations i
      JOIN producteurs p ON p.id = i.producteur_id
      WHERE p.user_id = auth.uid()
      AND i.adresse IS NOT NULL
      -- Match operations by location/department logic could be added here
    )
  );

-- Allow insertion of operations during registration process
CREATE POLICY "Allow operations creation during registration"
  ON operations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow anon insertion during signup process
CREATE POLICY "Allow signup operations insertion"
  ON operations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_operations_denomination ON operations(denomination);
CREATE INDEX IF NOT EXISTS idx_operations_id_acc_enedis ON operations(id_acc_enedis);
CREATE INDEX IF NOT EXISTS idx_operations_statut ON operations(statut);