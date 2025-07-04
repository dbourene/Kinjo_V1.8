/*
  # Create get_table_policies function for RLS diagnostics

  1. New Functions
    - `get_table_policies(table_name)` - Returns RLS policies for a given table
      - Returns policy name, command type, roles, qualification, and with_check conditions
      - Used for diagnostic purposes in the InstallationService

  2. Security
    - Function is accessible to authenticated users for diagnostic purposes
    - Uses existing PostgreSQL system catalogs (pg_policy, pg_roles)
*/

CREATE OR REPLACE FUNCTION public.get_table_policies(table_name text)
RETURNS TABLE(
  policyname name, 
  cmd text, 
  roles name[], 
  qual text, 
  with_check text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        polname AS policyname,
        CASE polcmd
            WHEN 'r' THEN 'SELECT'
            WHEN 'a' THEN 'INSERT'
            WHEN 'w' THEN 'UPDATE'
            WHEN 'd' THEN 'DELETE'
            WHEN '*' THEN 'ALL'
            ELSE 'UNKNOWN'
        END AS cmd,
        (SELECT array_agg(rolname) FROM pg_roles WHERE oid = ANY(polroles)) AS roles,
        pg_get_expr(polqual, polrelid) AS qual,
        pg_get_expr(polwithcheck, polrelid) AS with_check
    FROM pg_policy
    WHERE polrelid = table_name::regclass;
END;
$function$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_table_policies(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_policies(text) TO service_role;