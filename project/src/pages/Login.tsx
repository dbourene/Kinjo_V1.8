import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';

export const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Tentative de connexion pour:', formData.email);

      // Authenticate user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) {
        console.error('❌ Erreur d\'authentification:', authError);
        if (authError.message.includes('Invalid login credentials')) {
          setError('Vous n\'êtes pas encore inscrit');
        } else {
          setError('Erreur de connexion. Vérifiez vos identifiants.');
        }
        return;
      }

      if (!authData.user) {
        setError('Erreur de connexion');
        return;
      }

      console.log('✅ Utilisateur authentifié:', authData.user.id);

      // Check if user is a consumer
      console.log('🔍 Vérification dans la table consommateurs...');
      const { data: consommateurData, error: consommateurError } = await supabase
        .from('consommateurs')
        .select('id, contact_prenom, contact_nom, contact_email')
        .eq('user_id', authData.user.id);

      // If user found as consumer, redirect to consumer dashboard
      if (consommateurData && consommateurData.length > 0) {
        console.log('✅ Utilisateur trouvé en tant que consommateur:', consommateurData[0]);
        navigate('/consumer-dashboard');
        return;
      }

      // User not found as consumer, check if user is a producer (this is normal, no error)
      console.log('🔍 Vérification dans la table producteurs...');
      const { data: producteurData, error: producteurError } = await supabase
        .from('producteurs')
        .select('id, contact_prenom, contact_nom, contact_email')
        .eq('user_id', authData.user.id);

      // If user found as producer, redirect to producer dashboard
      if (producteurData && producteurData.length > 0) {
        console.log('✅ Utilisateur trouvé en tant que producteur:', producteurData[0]);
        navigate('/producer-dashboard');
        return;
      }

      // User authenticated but not found in either table
      console.log('⚠️ Utilisateur authentifié mais non trouvé dans les tables consommateurs et producteurs');
      setError('Vous n\'êtes pas encore inscrit');

    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="h-[40vh] bg-gradient-to-b from-[#1D4C3C] to-[#92C55E] rounded-b-[320px] flex items-center justify-center relative">
        <div className="text-center">
          <img 
            src={import.meta.env.BASE_URL + "Fichier 1@2x 5 (1).png"}
            alt="Kinjo Logo" 
            className="w-16 h-16 mx-auto mb-4 invert"
          />
          <h1 className="text-4xl font-parkisans font-bold text-white mb-2">Connexion</h1>
        </div>
      </div>
      
      <div className="max-w-md mx-auto px-4 -mt-8 relative z-10">
        <Card className="p-6 bg-white rounded-2xl shadow-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="votre.email@exemple.com"
                className="w-full"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Votre mot de passe"
                className="w-full"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
                {error === 'Vous n\'êtes pas encore inscrit' && (
                  <Button
                    onClick={handleBackToHome}
                    variant="outline"
                    className="mt-2 w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Retour à l'accueil
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150] disabled:opacity-50"
              >
                {loading ? 'Connexion...' : 'Valider'}
              </Button>

              <Button
                onClick={handleBackToHome}
                variant="outline"
                className="w-full rounded-xl h-12"
                disabled={loading}
              >
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};