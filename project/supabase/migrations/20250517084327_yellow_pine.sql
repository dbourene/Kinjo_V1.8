/*
  # Create participants and user_participants tables

  1. New Tables
    - `participants`: Stores participant information
      - Basic info (name, contact)
      - Company details (if applicable)
      - Installation details
    - `user_participants`: Links users to participants
      - Manages the relationship between auth users and participants

  2. Security
    - Enable RLS on both tables
    - Add policies for data access control
*/

-- Create the participants table
CREATE TABLE participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('company', 'individual')),
  identifier text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  prm_number text NOT NULL,
  company_name text,
  legal_form text,
  naf_code text,
  installation_address jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_identifier UNIQUE (identifier),
  CONSTRAINT unique_email UNIQUE (email),
  CONSTRAINT unique_prm UNIQUE (prm_number)
);

-- Create the user_participants junction table
CREATE TABLE user_participants (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, participant_id)
);

-- Enable RLS on participants
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_participants
ALTER TABLE user_participants ENABLE ROW LEVEL SECURITY;

-- Policies for participants table
CREATE POLICY "Users can read own data"
  ON participants
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id
    FROM user_participants
    WHERE participant_id = id
  ));

CREATE POLICY "Users can insert data"
  ON participants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for user_participants table
CREATE POLICY "Users can read own associations"
  ON user_participants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create associations"
  ON user_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);