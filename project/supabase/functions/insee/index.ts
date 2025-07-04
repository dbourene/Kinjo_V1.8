const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-insee-api-key-integration',
};

async function getCompanyData(siret: string, date: string): Promise<any> {
  try {
    const response = await fetch(
      `https://api.insee.fr/api-sirene/3.11/siret/${siret}?date=${date}`,
      {
        headers: {
          'Accept': 'application/json',
          'X-INSEE-Api-Key-Integration': '5703dac0-e902-4f7b-83da-c0e902bf7b94'
        },
      }
    );

    if (!response.ok) {
      throw new Error(`INSEE API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching company data:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let siret: string | null = null;
    const today = new Date().toISOString().split('T')[0];

    // Try to get SIRET from URL parameters first (GET request)
    const url = new URL(req.url);
    siret = url.searchParams.get('siret');

    // If not found in URL params, try to get it from request body (POST request)
    if (!siret && req.method === 'POST') {
      try {
        const body = await req.json();
        siret = body.siret;
      } catch (error) {
        console.error('Error parsing request body:', error);
      }
    }

    if (!siret) {
      throw new Error('SIRET parameter is required');
    }

    const data = await getCompanyData(siret, today);

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});