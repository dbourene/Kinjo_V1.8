// Edge function pour déclencher le calcul de production photovoltaïque
// Cette fonction est appelée automatiquement par le trigger PostgreSQL

import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

// Headers CORS pour permettre les appels depuis n'importe quelle origine
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Fonction principale
Deno.serve(async (req) => {
  // Gérer les requêtes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Récupérer l'ID de l'installation depuis le corps de la requête
    const { installation_id } = await req.json();
    
    if (!installation_id) {
      throw new Error('ID installation manquant');
    }

    console.log(`🔍 Traitement de l'installation: ${installation_id}`);

    // Créer un client Supabase avec la clé de service
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || 'https://jkpugvpeejprxyczkcqt.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        auth: {
          persistSession: false,
        }
      }
    );

    // Récupérer les détails de l'installation
    const { data: installation, error: installationError } = await supabaseAdmin
      .from('installations')
      .select('*')
      .eq('id', installation_id)
      .single();

    if (installationError || !installation) {
      throw new Error(`Erreur lors de la récupération de l'installation: ${installationError?.message || 'Installation non trouvée'}`);
    }

    console.log(`✅ Installation trouvée: ${installation.prm}`);

    // Appeler l'API Python externe
    const apiUrl = `https://e40408f4-8fab-4c94-9307-2d76caed2a13-00-na8gkmqrwmy8.picard.replit.dev:5000/installations/${installation_id}/calculate-production`;
    
    console.log(`🔄 Appel de l'API externe: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur API externe: ${response.status} ${response.statusText}`);
    }

    // Récupérer la réponse
    const result = await response.json();
    console.log(`✅ Résultat API: ${JSON.stringify(result)}`);

    // Mettre à jour l'installation avec l'énergie calculée
    if (result.energie_kwh) {
      const { error: updateError } = await supabaseAdmin
        .from('installations')
        .update({ energie_injectee: result.energie_kwh })
        .eq('id', installation_id);

      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour de l'installation: ${updateError.message}`);
      }

      console.log(`✅ Installation mise à jour avec énergie: ${result.energie_kwh} kWh`);
    }

    // Retourner le résultat
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Calcul de production effectué avec succès',
        data: result
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );

  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});