import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';

export const EmailConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [message, setMessage] = useState('');
  const [verificationData, setVerificationData] = useState<any>(null);

  useEffect(() => {
    const handleVerification = async () => {
      try {
        console.log('🔄 Début de la vérification des données');
        console.log('🔗 URL complète:', window.location.href);
        console.log('📋 Paramètres URL:', Object.fromEntries(searchParams.entries()));

        // Check if this is a verification request (from our registration flow)
        const isVerification = searchParams.get('verification') === 'true';

        if (isVerification) {
          console.log('✅ Mode vérification détecté');
          
          // Get verification data from sessionStorage
          const storedData = sessionStorage.getItem('kinjo_verification_data');
          if (!storedData) {
            throw new Error('Données de vérification non trouvées. Veuillez recommencer l\'inscription.');
          }

          const data = JSON.parse(storedData);
          console.log('📊 Données de vérification récupérées:', data);
          setVerificationData(data);

          // Verify that the data was actually inserted in the database
          const { data: dbData, error: dbError } = await supabase
            .from(data.tableName)
            .select('*')
            .eq('id', data.recordId)
            .single();

          if (dbError) {
            console.error('❌ Erreur lors de la vérification en base:', dbError);
            throw new Error('Impossible de vérifier les données en base de données');
          }

          if (!dbData) {
            throw new Error('Aucune donnée trouvée en base de données');
          }

          console.log('✅ Données vérifiées en base:', dbData);

          // Clean up verification data
          sessionStorage.removeItem('kinjo_verification_data');

          setStatus('success');
          setMessage(`Votre compte ${data.userType} a été créé avec succès et vos données sont bien enregistrées !`);
          
          // Auto-redirect after 5 seconds
          setTimeout(() => {
            navigate('/');
          }, 5000);
          
          return;
        }

        // Check if we have any valid email confirmation parameters
        const hasValidParams = searchParams.has('test_mode') || 
                              searchParams.has('access_token') || 
                              searchParams.has('token') || 
                              searchParams.has('token_hash');

        if (!hasValidParams) {
          console.log('❌ Aucun paramètre valide détecté');
          setStatus('invalid');
          setMessage('Cette page est destinée à la confirmation d\'email et ne peut pas être visitée directement.');
          return;
        }

        // Handle legacy email confirmation flow (if needed)
        console.log('🔄 Traitement de la confirmation email legacy...');
        setStatus('error');
        setMessage('Cette méthode de confirmation n\'est plus utilisée. Veuillez utiliser le nouveau flux d\'inscription.');

      } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
        setStatus('error');
        setMessage(error.message || 'Une erreur est survenue lors de la vérification');
      }
    };

    handleVerification();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <img 
            src={import.meta.env.BASE_URL + "Fichier 1@2x 5 (1).png"}
            alt="Kinjo Logo" 
            className="w-16 h-16 mx-auto mb-4"
          />
        </div>

        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#92C55E] mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold mb-4">Vérification en cours...</h2>
            <p className="text-neutral-600">Nous vérifions que vos données sont bien enregistrées dans la base de données.</p>
            
            {verificationData && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left">
                <h4 className="font-medium text-blue-800 mb-2">🔍 Vérification en cours :</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Type : {verificationData.userType}</p>
                  <p>• Email : {verificationData.email}</p>
                  <p>• Table : {verificationData.tableName}</p>
                  <p>• ID : {verificationData.recordId}</p>
                </div>
              </div>
            )}
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-green-600">Données vérifiées !</h2>
            <p className="text-neutral-600 mb-6">{message}</p>
            
            {verificationData && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg text-left">
                <h4 className="font-medium text-green-800 mb-3">✅ Vérification réussie :</h4>
                <div className="text-sm text-green-700 space-y-2">
                  <div className="flex justify-between">
                    <span>Type d'utilisateur :</span>
                    <span className="font-medium">{verificationData.userType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type d'inscription :</span>
                    <span className="font-medium">{verificationData.registrationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email :</span>
                    <span className="font-medium">{verificationData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base de données :</span>
                    <span className="font-medium">{verificationData.tableName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Statut :</span>
                    <span className="font-medium text-green-600">✅ Enregistré</span>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-sm text-neutral-500 mb-4">Redirection automatique vers l'accueil dans 5 secondes...</p>
            <Button
              onClick={() => navigate('/')}
              className="bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
            >
              Retour à l'accueil
            </Button>
          </>
        )}

        {status === 'invalid' && (
          <>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Page de vérification</h2>
            <p className="text-neutral-600 mb-6">{message}</p>
            
            <div className="mb-6 p-4 bg-blue-50 rounded-lg text-left">
              <h3 className="font-semibold text-blue-800 mb-2">Comment créer votre compte :</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                <li>Allez sur la page d'inscription</li>
                <li>Remplissez le formulaire d'inscription</li>
                <li>Cliquez sur "Créer mon compte" à la dernière étape</li>
                <li>Vos données seront automatiquement vérifiées</li>
              </ol>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/register')}
                className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
              >
                Aller à l'inscription
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full rounded-xl h-12"
              >
                Retour à l'accueil
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-red-600">Erreur de vérification</h2>
            <p className="text-neutral-600 mb-6 whitespace-pre-line">{message}</p>
            
            <div className="mb-6 p-3 bg-yellow-50 rounded-lg text-left">
              <h4 className="font-semibold text-yellow-800 mb-2">🛠️ Solutions possibles :</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                <li>Recommencer l'inscription depuis le début</li>
                <li>Vérifier que vous avez bien cliqué sur "Créer mon compte"</li>
                <li>Contacter le support si le problème persiste</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/register')}
                className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
              >
                Recommencer l'inscription
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full rounded-xl h-12"
              >
                Retour à l'accueil
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};