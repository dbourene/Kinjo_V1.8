import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import 'leaflet/dist/leaflet.css';

// Helper function to safely encode UTF-8 strings to base64
const utf8_to_b64 = (str: string) => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
};

// Créer une icône avec le logo producteur (éclair électrique) et popup tarif permanent
const createProducerIcon = (tariff: number) => {
  // Créer un DivIcon HTML personnalisé avec le logo producteur
  const iconHtml = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <!-- Logo producteur (éclair électrique) -->
      <div style="
        width: 40px; 
        height: 40px; 
        background: linear-gradient(135deg, #4F46E5, #7C3AED);
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      </div>
      
      <!-- Popup tarif permanent -->
      <div style="
        background: #FFD700;
        color: #1F2937;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: bold;
        margin-top: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        border: 2px solid #FFA500;
        white-space: nowrap;
        position: relative;
      ">
        ${tariff} ct€/kWh
        <!-- Petite flèche pointant vers l'icône -->
        <div style="
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 6px solid #FFA500;
        "></div>
      </div>
    </div>
  `;

  return new DivIcon({
    html: iconHtml,
    className: 'custom-producer-icon',
    iconSize: [60, 70], // Taille augmentée pour inclure le popup
    iconAnchor: [30, 70], // Point d'ancrage ajusté
    popupAnchor: [0, -70] // Position du popup principal
  });
};

export const ProducerMap = () => {
  const navigate = useNavigate();
  const [producerData, setProducerData] = useState<any>(null);
  const [installations, setInstallations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([46.603354, 1.888334]); // Centre de la France par défaut
  const [mapZoom, setMapZoom] = useState(6);

  useEffect(() => {
    const loadProducerData = async () => {
      try {
        console.log('🔄 Chargement des données producteur...');
        
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
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (producerError) {
          console.error('❌ Erreur lors du chargement des données producteur:', producerError);
          navigate('/login');
          return;
        }

        console.log('✅ Données producteur chargées:', producerData);
        setProducerData(producerData);

        // Get installations data with coordinates
        const { data: installationsData, error: installationsError } = await supabase
          .from('installations')
          .select('*')
          .eq('producteur_id', producerData.id);

        if (installationsError) {
          console.error('❌ Erreur lors du chargement des installations:', installationsError);
        } else {
          console.log('✅ Installations chargées:', installationsData);
          setInstallations(installationsData || []);
          
          // Si on a des installations avec coordonnées, centrer la carte sur la première
          if (installationsData && installationsData.length > 0) {
            const firstInstallation = installationsData[0];
            if (firstInstallation.latitude && firstInstallation.longitude) {
              setMapCenter([firstInstallation.latitude, firstInstallation.longitude]);
              
              // Calculer le zoom pour que 60km correspondent à la hauteur de la fenêtre
              // Approximation : 1 degré ≈ 111 km, donc 60km ≈ 0.54 degrés
              // Pour une hauteur de fenêtre standard, zoom 10-11 convient
              setMapZoom(13);
              
              console.log('🗺️ Carte centrée sur:', [firstInstallation.latitude, firstInstallation.longitude]);
            }
          }
        }

      } catch (error) {
        console.error('❌ Erreur:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadProducerData();
  }, [navigate]);

  const handleBackToDashboard = () => {
    navigate('/producer-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#92C55E] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (!producerData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Données producteur non trouvées</h2>
          <p className="text-gray-600 mb-4">Veuillez vous reconnecter</p>
          <Button onClick={() => navigate('/login')} className="bg-[#92C55E] text-white">
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="h-[15vh] bg-gradient-to-b from-[#1D4C3C] to-[#92C55E] rounded-b-[80px] flex items-center justify-center relative">
        <div className="text-center">
          <img 
            src={import.meta.env.BASE_URL + "Fichier 1@2x 5 (1).png"}
            alt="Kinjo Logo" 
            className="w-10 h-10 mx-auto mb-2 invert"
          />
          <h1 className="text-xl font-parkisans font-bold text-white">
            Carte Producteur
          </h1>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 -mt-4 relative z-10">
        <Card className="p-4 bg-white rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Bonjour {producerData?.contact_prenom} !
            </h2>
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              className="rounded-xl"
            >
              ← Retour au tableau de bord
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Sidebar avec informations */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">📊 Mes Installations</h3>
                
                {installations.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Aucune installation trouvée</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {installations.map((installation, index) => (
                      <div key={installation.id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">⚡</span>
                          <span className="font-medium text-sm">Installation {index + 1}</span>
                        </div>
                        
                        <div className="space-y-1 text-xs">
                          <p><span className="font-medium">PRM:</span> {installation.prm}</p>
                          <p><span className="font-medium">Puissance:</span> {installation.puissance} kWc</p>
                          <p><span className="font-medium">Tarif:</span> 
                            <span className="font-bold text-orange-600 ml-1">
                              {installation.tarif_base} ct€/kWh
                            </span>
                          </p>
                          {installation.adresse && (
                            <p><span className="font-medium">Adresse:</span> {installation.adresse}</p>
                          )}
                          {installation.latitude && installation.longitude ? (
                            <p className="text-green-600">📍 Localisée sur la carte</p>
                          ) : (
                            <p className="text-red-500">📍 Position non disponible</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">ℹ️ Légende</h4>
                  <div className="space-y-1 text-xs text-blue-700">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">⚡</span>
                      <span>Vos installations</span>
                    </div>
                    <p>Le tarif s'affiche en permanence sous chaque marqueur</p>
                    <p>Zoom réglé pour 60km de hauteur</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Zone carte principale */}
            <div className="lg:col-span-3">
              <Card className="p-4">
                <div className="w-full h-96 rounded-lg overflow-hidden">
                  <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-lg"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Marqueurs pour chaque installation avec nouveau design */}
                    {installations
                      .filter(installation => installation.latitude && installation.longitude && installation.tarif_base)
                      .map((installation, index) => (
                        <Marker
                          key={installation.id}
                          position={[installation.latitude, installation.longitude]}
                          icon={createProducerIcon(installation.tarif_base)}
                        >
                          <Popup>
                            <div className="p-2">
                              <h4 className="font-bold text-lg mb-2">⚡ Installation {index + 1}</h4>
                              
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">PRM:</span> {installation.prm}</p>
                                <p><span className="font-medium">Puissance:</span> {installation.puissance} kWc</p>
                                <p><span className="font-medium">Tarif:</span> 
                                  <span className="font-bold text-orange-600 ml-1">
                                    {installation.tarif_base} ct€/kWh
                                  </span>
                                </p>
                                
                                {installation.titulaire && (
                                  <p><span className="font-medium">Titulaire:</span> {installation.titulaire}</p>
                                )}
                                
                                {installation.adresse && (
                                  <p><span className="font-medium">Adresse:</span> {installation.adresse}</p>
                                )}
                                
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="text-xs text-gray-500">
                                    📍 {installation.latitude.toFixed(6)}, {installation.longitude.toFixed(6)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))
                    }
                  </MapContainer>
                </div>
                
                {installations.filter(i => i.latitude && i.longitude).length === 0 && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Aucune installation localisée</h3>
                      <p className="text-gray-600 text-sm">
                        Vos installations n'ont pas de coordonnées GPS.<br/>
                        Contactez le support pour mettre à jour vos données.
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </Card>
      </div>

      {/* Styles CSS pour les icônes personnalisées */}
      <style jsx>{`
        .custom-producer-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};