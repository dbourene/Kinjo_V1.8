/*
  # Fix Storage Access for annexes21 Bucket

  1. Storage Policies
    - Enable RLS on storage.objects if not already enabled
    - Add policy for anonymous users to read template files
    - Add policy for authenticated users to read all files in annexes21 bucket
    - Add policy for authenticated users to upload files to operations/ folder
    - Add policy for service role to have full access

  2. Security
    - Anonymous users can only read template files (type/ folder)
    - Authenticated users can read all files and upload to operations/ folder
    - Service role has full access for administrative operations
*/

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for anonymous users to read template files
CREATE POLICY "Anonymous users can read template files"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (
    bucket_id = 'annexes21' 
    AND name LIKE 'type/%'
  );

-- Policy for authenticated users to read all files in annexes21 bucket
CREATE POLICY "Authenticated users can read annexes21 files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'annexes21');

-- Policy for authenticated users to upload files to operations folder
CREATE POLICY "Authenticated users can upload to operations folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'annexes21' 
    AND name LIKE 'operations/%'
  );

-- Policy for authenticated users to update files in operations folder
CREATE POLICY "Authenticated users can update operations files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'annexes21' 
    AND name LIKE 'operations/%'
  )
  WITH CHECK (
    bucket_id = 'annexes21' 
    AND name LIKE 'operations/%'
  );

-- Policy for service role to have full access
CREATE POLICY "Service role full access to annexes21"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'annexes21')
  WITH CHECK (bucket_id = 'annexes21');

-- Ensure the bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'annexes21',
  'annexes21',
  true,
  52428800, -- 50MB limit
  ARRAY['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];