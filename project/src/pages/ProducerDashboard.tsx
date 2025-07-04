import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export const ProducerDashboard = () => {
  const navigate = useNavigate();
  const [producerData, setProducerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducerData = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('❌ Erreur utilisateur:', userError);
          navigate('/login');
          return;
        }

        // Get producer data
        const { data: producerData, error: producerError } = await supabase
          .from('producteurs')
          .select('id, contact_prenom, contact_nom, contact_email')
          .eq('user_id', user.id)
          .single();

        if (producerError) {
          console.error('❌ Erreur lors du chargement des données producteur:', producerError);
          navigate('/login');
          return;
        }

        setProducerData(producerData);
      } catch (error) {
        console.error('❌ Erreur:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadProducerData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      navigate('/');
    }
  };

  const handleViewMap = () => {
    navigate('/producer-map');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#92C55E]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="h-[40vh] bg-gradient-to-b from-[#1D4C3C] to-[#92C55E] rounded-b-[320px] flex items-center justify-center relative">
        <div className="text-center">
          <img 
            src={import.meta.env.BASE_URL + "Fichier 1@2x 5 (1).png"}
            alt="Kinjo Logo" 
            className="w-16 h-16 mx-auto mb-4 invert"
          />
          <h1 className="text-4xl font-parkisans font-bold text-white mb-2">Espace Producteur</h1>
        </div>
      </div>
      
      <div className="max-w-md mx-auto px-4 -mt-8 relative z-10">
        <Card className="p-6 bg-white rounded-2xl shadow-lg">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800">
              Bonjour {producerData?.contact_prenom} !
            </h2>
            
            <p className="text-gray-600">
              Vous êtes bien connecté en tant que producteur
            </p>

            <div className="pt-4 space-y-3">
              <Button
                onClick={handleViewMap}
                className="w-full bg-blue-600 text-white rounded-xl h-12 hover:bg-blue-700"
              >
                🗺️ Voir la carte
              </Button>
              
              <Button
                onClick={handleLogout}
                className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
              >
                Accueil
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};