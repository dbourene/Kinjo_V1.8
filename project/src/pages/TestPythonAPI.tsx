import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { InstallationService } from '../services/installation-service';
import { supabase } from '../lib/supabase';

export const TestPythonAPI = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [installationData, setInstallationData] = useState<any>(null);

  const targetInstallationId = 'eb7f2618-58eb-4b3b-9db3-449ad8205596';

  const runFullTest = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      console.log('🚀 === TEST COMPLET API PYTHON ===');
      
      // Étape 1: Récupérer les données de l'installation cible
      console.log(`🔍 Récupération de l'installation ${targetInstallationId}...`);
      
      const { data: installation, error: installationError } = await supabase
        .from('installations')
        .select(`
          *,
          producteurs:producteur_id (
            id,
            contact_prenom,
            contact_nom,
            contact_email,
            siret,
            denominationUniteLegale
          )
        `)
        .eq('id', targetInstallationId)
        .single();

      if (installationError || !installation) {
        throw new Error(`Installation non trouvée: ${installationError?.message || 'ID invalide'}`);
      }

      console.log('✅ Installation trouvée:', installation);
      setInstallationData(installation);

      // Étape 2: Vérifier l'état initial de energie_injectee
      console.log(`📊 État initial - energie_injectee: ${installation.energie_injectee || 'NULL'}`);

      // Étape 3: Tester l'appel direct à l'API Python
      console.log('🐍 Test direct de l\'API Python...');
      
      const pythonApiUrl = `https://e40408f4-8fab-4c94-9307-2d76caed2a13-00-na8gkmqrwmy8.picard.replit.dev:5000/installations/${targetInstallationId}/calculate-production`;
      
      console.log(`🔗 URL API Python: ${pythonApiUrl}`);
      
      try {
        const pythonResponse = await fetch(pythonApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log(`📡 Statut réponse API Python: ${pythonResponse.status}`);
        
        if (!pythonResponse.ok) {
          const errorText = await pythonResponse.text();
          console.error(`❌ Erreur API Python: ${pythonResponse.status} - ${errorText}`);
          throw new Error(`API Python error: ${pythonResponse.status} - ${errorText}`);
        }

        const pythonResult = await pythonResponse.json();
        console.log('✅ Réponse API Python:', pythonResult);

        // Étape 4: Mettre à jour manuellement la base de données
        if (pythonResult.energie_kwh) {
          console.log(`🔄 Mise à jour de energie_injectee avec ${pythonResult.energie_kwh} kWh...`);
          
          const { error: updateError } = await supabase
            .from('installations')
            .update({ energie_injectee: pythonResult.energie_kwh })
            .eq('id', targetInstallationId);

          if (updateError) {
            console.error('❌ Erreur mise à jour:', updateError);
            throw new Error(`Erreur mise à jour: ${updateError.message}`);
          }

          console.log('✅ Base de données mise à jour avec succès');
        }

        // Étape 5: Vérifier la mise à jour
        const { data: updatedInstallation, error: verifyError } = await supabase
          .from('installations')
          .select('energie_injectee')
          .eq('id', targetInstallationId)
          .single();

        if (verifyError) {
          console.error('❌ Erreur vérification:', verifyError);
        } else {
          console.log(`✅ Vérification - nouvelle valeur energie_injectee: ${updatedInstallation.energie_injectee}`);
        }

        // Étape 6: Tester l'edge function Supabase
        console.log('🔄 Test de l\'edge function Supabase...');
        
        const edgeFunctionResult = await InstallationService.triggerProductionCalculation(targetInstallationId);
        
        if (edgeFunctionResult.success) {
          console.log('✅ Edge function exécutée avec succès:', edgeFunctionResult.data);
        } else {
          console.error('❌ Erreur edge function:', edgeFunctionResult.error);
        }

        setResults({
          installation,
          pythonApiResult: pythonResult,
          edgeFunctionResult,
          updatedEnergie: updatedInstallation?.energie_injectee,
          success: true
        });

      } catch (pythonError) {
        console.error('❌ Erreur lors de l\'appel à l\'API Python:', pythonError);
        
        setResults({
          installation,
          error: `Erreur API Python: ${pythonError.message}`,
          success: false
        });
      }

    } catch (error) {
      console.error('❌ Erreur générale:', error);
      setResults({
        error: error.message,
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const testEdgeFunctionOnly = async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Test uniquement de l\'edge function...');
      
      const result = await InstallationService.triggerProductionCalculation(targetInstallationId);
      
      setResults({
        edgeFunctionOnly: true,
        edgeFunctionResult: result,
        success: result.success
      });
      
    } catch (error) {
      console.error('❌ Erreur edge function:', error);
      setResults({
        edgeFunctionOnly: true,
        error: error.message,
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const runDiagnostic = async () => {
    setLoading(true);
    
    try {
      console.log('🔍 Lancement du diagnostic complet...');
      await InstallationService.runDiagnostic();
      
      setResults({
        diagnostic: true,
        message: 'Diagnostic terminé - voir la console pour les détails',
        success: true
      });
      
    } catch (error) {
      console.error('❌ Erreur diagnostic:', error);
      setResults({
        diagnostic: true,
        error: error.message,
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">🧪 Test API Python - Calcul de Production</h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🎯 Installation Cible</h3>
            <p className="text-blue-700 font-mono text-sm">{targetInstallationId}</p>
          </div>

          <div className="space-y-4 mb-6">
            <Button
              onClick={runFullTest}
              disabled={loading}
              className="w-full bg-green-600 text-white hover:bg-green-700"
            >
              {loading ? '🔄 Test en cours...' : '🚀 Test Complet (API Python + Edge Function)'}
            </Button>

            <Button
              onClick={testEdgeFunctionOnly}
              disabled={loading}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? '🔄 Test en cours...' : '⚡ Test Edge Function Uniquement'}
            </Button>

            <Button
              onClick={runDiagnostic}
              disabled={loading}
              className="w-full bg-purple-600 text-white hover:bg-purple-700"
            >
              {loading ? '🔄 Diagnostic en cours...' : '🔍 Diagnostic Complet (voir console)'}
            </Button>
          </div>

          {installationData && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">📊 Données Installation</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>PRM:</strong> {installationData.prm}</div>
                <div><strong>Puissance:</strong> {installationData.puissance} kWc</div>
                <div><strong>Latitude:</strong> {installationData.latitude}</div>
                <div><strong>Longitude:</strong> {installationData.longitude}</div>
                <div><strong>Énergie Injectée:</strong> {installationData.energie_injectee || 'NULL'} kWh</div>
                <div><strong>Producteur:</strong> {installationData.producteurs?.contact_prenom} {installationData.producteurs?.contact_nom}</div>
              </div>
            </div>
          )}

          {results && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">
                {results.success ? '✅ Résultats' : '❌ Erreurs'}
              </h3>
              <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">📋 Instructions</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• <strong>Test Complet:</strong> Teste l'API Python directement + edge function</li>
              <li>• <strong>Edge Function:</strong> Teste uniquement l'edge function Supabase</li>
              <li>• <strong>Diagnostic:</strong> Vérifie l'accès aux données (voir console)</li>
              <li>• Ouvrez la console développeur (F12) pour voir tous les logs détaillés</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};