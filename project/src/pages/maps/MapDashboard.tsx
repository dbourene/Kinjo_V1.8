import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

interface MapDashboardProps {
  userType: 'producer' | 'consumer';
  userData: any;
}

export const MapDashboard: React.FC<MapDashboardProps> = ({ userType, userData }) => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    if (userType === 'producer') {
      navigate('/producer-dashboard');
    } else {
      navigate('/consumer-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="h-[20vh] bg-gradient-to-b from-[#1D4C3C] to-[#92C55E] rounded-b-[160px] flex items-center justify-center relative">
        <div className="text-center">
          <img 
            src={import.meta.env.BASE_URL + "Fichier 1@2x 5 (1).png"}
            alt="Kinjo Logo" 
            className="w-12 h-12 mx-auto mb-2 invert"
          />
          <h1 className="text-2xl font-parkisans font-bold text-white">
            Cartographie {userType === 'producer' ? 'Producteur' : 'Consommateur'}
          </h1>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 -mt-4 relative z-10">
        <Card className="p-6 bg-white rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Bonjour {userData?.contact_prenom} !
            </h2>
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              className="rounded-xl"
            >
              Retour au tableau de bord
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar avec informations */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Informations</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Email:</span> {userData?.contact_email}</p>
                  <p><span className="font-medium">Type:</span> {userType === 'producer' ? 'Producteur' : 'Consommateur'}</p>
                  {userType === 'consumer' && userData?.prm && (
                    <p><span className="font-medium">PRM:</span> {userData.prm}</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Zone carte principale */}
            <div className="lg:col-span-2">
              <Card className="p-4 h-96">
                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Carte Leaflet</h3>
                    <p className="text-gray-600 text-sm">
                      La carte interactive sera intégrée ici
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};