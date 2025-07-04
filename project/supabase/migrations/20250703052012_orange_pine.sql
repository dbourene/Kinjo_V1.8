/*
  # Trigger automatique pour calcul de production photovoltaique

  1. Fonction trigger
    - Declenche un appel a l'edge function apres insertion d'installation
    - Utilise pg_net pour faire l'appel HTTP asynchrone

  2. Trigger
    - Se declenche AFTER INSERT sur la table installations
    - Appelle automatiquement l'API Python pour calculer la production

  3. Securite
    - Utilise la service role key pour l'authentification
    - Gestion d'erreur pour eviter de bloquer l'insertion
*/

-- Activer l'extension pg_net si pas deja fait
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Fonction qui sera appelee par le trigger
CREATE OR REPLACE FUNCTION trigger_production_calculation()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  edge_function_url text;
BEGIN
  -- Recuperer l'URL Supabase depuis les variables d'environnement
  -- En production, ces valeurs seront automatiquement disponibles
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Si les variables ne sont pas definies, utiliser les valeurs par defaut
  IF supabase_url IS NULL THEN
    supabase_url := 'https://jkpugvpeejprxyczkcqt.supabase.co';
  END IF;
  
  IF service_role_key IS NULL THEN
    service_role_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcHVndnBlZWpwcnh5Y3prY3F0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQ2NTU1OSwiZXhwIjoyMDYzMDQxNTU5fQ.q6_q0TetSkY2njOdjZ3Zsq5DgfzSL9Exhn65fV04sRc';
  END IF;
  
  -- Construire URL de edge function
  edge_function_url := supabase_url || '/functions/v1/calculate-production';
  
  -- Appeler edge function de maniere asynchrone avec pg_net
  PERFORM pg_net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'installation_id', NEW.id
    )::text
  );
  
  -- Retourner NEW pour continuer operation d'insertion
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, logger l'erreur mais laisser l'insertion se terminer
    RAISE NOTICE 'Erreur lors du declenchement du calcul de production: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Creer le trigger sur la table installations
DROP TRIGGER IF EXISTS trigger_calculate_production ON installations;
CREATE TRIGGER trigger_calculate_production
  AFTER INSERT ON installations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_production_calculation();

-- Ajouter un commentaire pour la documentation
COMMENT ON FUNCTION trigger_production_calculation() IS 'Declenche automatiquement le calcul de production photovoltaique via API Python externe apres insertion installation';