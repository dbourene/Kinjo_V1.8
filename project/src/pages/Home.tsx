import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();

  const handleRegister = (type: 'producteur' | 'consommateur') => {
    navigate(`/register?type=${type}`);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="h-[50vh] bg-gradient-to-b from-[#1D4C3C] to-[#92C55E] rounded-b-[320px] flex items-center justify-center relative">
        <div className="text-center">
          <img 
            src={import.meta.env.BASE_URL + "Fichier 1@2x 5 (1).png"}
            alt="Kinjo Logo" 
            className="w-20 h-20 mx-auto mb-6 invert"
          />
          <h1 className="text-5xl font-parkisans font-bold text-white mb-2">Bienvenue !</h1>
        </div>
      </div>
      
      <div className="max-w-md mx-auto px-4 -mt-8 relative z-10">
        <div className="space-y-4">
          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-white rounded-2xl"
            onClick={() => handleRegister('producteur')}
          >
            <h2 className="text-xl font-poppins font-medium mb-2">Producteur</h2>
            <p className="text-gray-600 font-poppins">Partagez votre énergie renouvelable et contribuez à un avenir durable.</p>
          </Card>
          
          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-white rounded-2xl"
            onClick={() => handleRegister('consommateur')}
          >
            <h2 className="text-xl font-poppins font-medium mb-2">Consommateur</h2>
            <p className="text-gray-600 font-poppins">Accédez à une énergie propre et renouvelable de votre communauté locale.</p>
          </Card>

          <div className="pt-4">
           <Button
              onClick={handleLogin}
              variant="outline"
              className="w-full h-12 rounded-xl border-2 border-[#92C55E] bg-[#92C55E] text-white transition-colors"
            >
              Déjà inscrit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}