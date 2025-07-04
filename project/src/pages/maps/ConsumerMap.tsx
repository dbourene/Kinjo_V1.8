import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { InstallationService } from '../../services/installation-service';
import 'leaflet/dist/leaflet.css';

// Helper function to safely encode UTF-8 strings to base64
const utf8_to_b64 = (str: string) => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
};

// Créer une icône d'usine pour les entreprises
const createFactoryIcon = () => {
  const svgIcon = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <!-- Cercle de fond -->
      <circle cx="20" cy="20" r="18" fill="#4F46E5" stroke="#3730A3" stroke-width="2" filter="url(#shadow)"/>
      <!-- Icône usine -->
      <rect x="8" y="15" width="24" height="12" fill="white" stroke="#4F46E5" stroke-width="1"/>
      <rect x="10" y="12" width="4" height="3" fill="white"/>
      <rect x="16" y="10" width="4" height="5" fill="white"/>
      <rect x="22" y="8" width="4" height="7" fill="white"/>
      <rect x="28" y="11" width="4" height="4" fill="white"/>
      <!-- Cheminées -->
      <rect x="11" y="8" width="2" height="4" fill="#6B7280"/>
      <rect x="17" y="6" width="2" height="4" fill="#6B7280"/>
      <rect x="23" y="4" width="2" height="4" fill="#6B7280"/>
      <rect x="29" y="7" width="2" height="4" fill="#6B7280"/>
    </svg>
  `;

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${utf8_to_b64(svgIcon)}`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Créer une icône de maison pour les particuliers
const createHouseIcon = () => {
  const svgIcon = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <!-- Cercle de fond -->
      <circle cx="20" cy="20" r="18" fill="#10B981" stroke="#059669" stroke-width="2" filter="url(#shadow)"/>
      <!-- Maison -->
      <polygon points="20,8 12,16 28,16" fill="white" stroke="#10B981" stroke-width="1"/>
      <rect x="14" y="16" width="12" height="10" fill="white" stroke="#10B981" stroke-width="1"/>
      <rect x="17" y="19" width="6" height="7" fill="#10B981"/>
      <rect x="15" y="20" width="3" height="3" fill="#10B981"/>
      <rect x="22" y="20" width="3" height="3" fill="#10B981"/>
    </svg>
  `;

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${utf8_to_b64(svgIcon)}`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
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

// Fonction pour calculer la distance entre deux points (formule de Haversine)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const ConsumerMap = () => {
  const navigate = useNavigate();
  const [consumerData, setConsumerData] = useState<any>(null);
  const [nearbyInstallations, setNearbyInstallations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [diagnosticResults, setDiagnosticResults] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([46.603354, 1.888334]); // Centre de la France par défaut
  const [mapZoom, setMapZoom] = useState(6);

  useEffect(() => {
    const loadConsumerData = async () => {
      try {
        console.log('🔄 Chargement des données consommateur...');
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('❌ Erreur utilisateur:', userError);
          navigate('/login');
          return;
        }

        // Get consumer data
        const { data: consumerData, error: consumerError } = await supabase
          .from('consommateurs')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (consumerError) {
          console.error('❌ Erreur lors du chargement des données consommateur:', consumerError);
          navigate('/login');
          return;
        }

        console.log('✅ Données consommateur chargées:', consumerData);
        setConsumerData(consumerData);

        // NOUVEAU: Lancer le diagnostic complet
        console.log('🚀 Lancement du diagnostic des installations...');
        await InstallationService.runDiagnostic();

        // Si le consommateur a des coordonnées, centrer la carte sur sa position
        if (consumerData.latitude && consumerData.longitude) {
          setMapCenter([consumerData.latitude, consumerData.longitude]);
          setMapZoom(11); // Zoom pour voir environ 20km autour
          
          console.log('🗺️ Carte centrée sur le consommateur:', [consumerData.latitude, consumerData.longitude]);

          // Utiliser le service pour charger les installations
          try {
            const installations = await InstallationService.findNearbyInstallations(
              consumerData.latitude, 
              consumerData.longitude, 
              20
            );
            
            console.log(`✅ Service retourné: ${installations.length} installations`);
            setNearbyInstallations(installations);
            
          } catch (error) {
            console.error('❌ Erreur service installations:', error);
            setDiagnosticResults(`Erreur: ${error.message}`);
          }
        } else {
          console.log('⚠️ Consommateur sans coordonnées');
          setDiagnosticResults('Consommateur sans coordonnées GPS');
        }

      } catch (error) {
        console.error('❌ Erreur:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadConsumerData();
  }, [navigate]);

  const handleBackToDashboard = () => {
    navigate('/consumer-dashboard');
  };

  // Déterminer le texte à afficher pour le consommateur
  const getConsumerDisplayText = () => {
    if (!consumerData) return 'Vous';
    
    // Vérifier si c'est une entreprise en regardant si on a des données SIRET
    const isCompany = consumerData.siret || consumerData.denominationUniteLegale;
    
    if (isCompany) {
      // Pour une entreprise, utiliser sigleUniteLegale ou "Vous" si null
      return consumerData.sigleUniteLegale || 'Vous';
    } else {
      // Pour un particulier, utiliser le prénom
      return consumerData.contact_prenom || 'Vous';
    }
  };

  // Déterminer l'icône à utiliser pour le consommateur
  const getConsumerIcon = () => {
    if (!consumerData) return createHouseIcon();
    
    const isCompany = consumerData.siret || consumerData.denominationUniteLegale;
    return isCompany ? createFactoryIcon() : createHouseIcon();
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

  if (!consumerData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Données consommateur non trouvées</h2>
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
            Carte Consommateur
          </h1>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 -mt-4 relative z-10">
        <Card className="p-4 bg-white rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Bonjour {consumerData?.contact_prenom} !
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
                <h3 className="font-semibold mb-4">🔍 Diagnostic Installations</h3>
                
                {/* Informations du consommateur */}
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{consumerData.siret ? '🏭' : '🏠'}</span>
                    <span className="font-medium text-sm">Votre position</span>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <p><span className="font-medium">Nom:</span> {getConsumerDisplayText()}</p>
                    <p><span className="font-medium">PRM:</span> {consumerData.prm}</p>
                    {consumerData.adresse && (
                      <p><span className="font-medium">Adresse:</span> {consumerData.adresse}</p>
                    )}
                    {consumerData.latitude && consumerData.longitude ? (
                      <p className="text-green-600">📍 Localisé sur la carte</p>
                    ) : (
                      <p className="text-red-500">📍 Position non disponible</p>
                    )}
                  </div>
                </div>

                {/* Résultats du diagnostic */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">🧪 Diagnostic</h4>
                  <div className="space-y-1 text-xs text-blue-700">
                    <p>Installations trouvées: {nearbyInstallations.length}</p>
                    <p>Position consommateur: {consumerData.latitude ? 'OK' : 'Manquante'}</p>
                    {consumerData.latitude && consumerData.longitude && (
                      <p>Coordonnées: {consumerData.latitude.toFixed(6)}, {consumerData.longitude.toFixed(6)}</p>
                    )}
                    {diagnosticResults && (
                      <p className="text-red-600">Erreur: {diagnosticResults}</p>
                    )}
                  </div>
                </div>

                {/* Liste des installations à proximité */}
                {nearbyInstallations.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">
                      {consumerData.latitude && consumerData.longitude 
                        ? 'Aucun producteur trouvé dans un rayon de 20km'
                        : 'Position non disponible pour la recherche'
                      }
                    </p>
                    <p className="text-xs text-red-500 mt-2">
                      Vérifiez la console pour le diagnostic complet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {nearbyInstallations.map((installation, index) => {
                      const distance = consumerData.latitude && consumerData.longitude 
                        ? installation.distance || calculateDistance(
                            consumerData.latitude,
                            consumerData.longitude,
                            installation.latitude,
                            installation.longitude
                          )
                        : 'N/A';
                      
                      return (
                        <div key={installation.id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">⚡</span>
                            <span className="font-medium text-sm">Producteur {index + 1}</span>
                          </div>
                          
                          <div className="space-y-1 text-xs">
                            <p><span className="font-medium">Tarif:</span> 
                              <span className="font-bold text-orange-600 ml-1">
                                {installation.tarif_base} ct€/kWh
                              </span>
                            </p>
                            <p><span className="font-medium">Puissance:</span> {installation.puissance} kWc</p>
                            {typeof distance === 'number' && (
                              <p><span className="font-medium">Distance:</span> {distance.toFixed(1)} km</p>
                            )}
                            {installation.producteurs && (
                              <p><span className="font-medium">Contact:</span> {installation.producteurs.contact_prenom} {installation.producteurs.contact_nom}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">ℹ️ Légende</h4>
                  <div className="space-y-1 text-xs text-blue-700">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🏠</span>
                      <span>Vous (particulier)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🏭</span>
                      <span>Vous (entreprise)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">⚡</span>
                      <span>Producteurs (≤20km)</span>
                    </div>
                    <p>Le tarif s'affiche en permanence sous chaque producteur</p>
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
                    
                    {/* Marqueur pour le consommateur */}
                    {consumerData.latitude && consumerData.longitude && (
                      <Marker
                        position={[consumerData.latitude, consumerData.longitude]}
                        icon={getConsumerIcon()}
                      >
                        <Popup>
                          <div className="p-2">
                            <h4 className="font-bold text-lg mb-2">
                              {consumerData.siret ? '🏭' : '🏠'} {getConsumerDisplayText()}
                            </h4>
                            
                            <div className="space-y-1 text-sm">
                              <p><span className="font-medium">Type:</span> {consumerData.siret ? 'Entreprise' : 'Particulier'}</p>
                              <p><span className="font-medium">PRM:</span> {consumerData.prm}</p>
                              <p><span className="font-medium">Email:</span> {consumerData.contact_email}</p>
                              
                              {consumerData.adresse && (
                                <p><span className="font-medium">Adresse:</span> {consumerData.adresse}</p>
                              )}
                              
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                  📍 {consumerData.latitude.toFixed(6)}, {consumerData.longitude.toFixed(6)}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                  {nearbyInstallations.length} producteur(s) dans un rayon de 20km
                                </p>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    
                    {/* Marqueurs pour les installations à proximité avec nouveau design */}
                    {nearbyInstallations.map((installation, index) => {
                      const distance = consumerData.latitude && consumerData.longitude 
                        ? installation.distance || calculateDistance(
                            consumerData.latitude,
                            consumerData.longitude,
                            installation.latitude,
                            installation.longitude
                          )
                        : null;
                      
                      return (
                        <Marker
                          key={installation.id}
                          position={[installation.latitude, installation.longitude]}
                          icon={createProducerIcon(installation.tarif_base)}
                        >
                          <Popup>
                            <div className="p-2">
                              <h4 className="font-bold text-lg mb-2">⚡ Producteur {index + 1}</h4>
                              
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Tarif:</span> 
                                  <span className="font-bold text-orange-600 ml-1">
                                    {installation.tarif_base} ct€/kWh
                                  </span>
                                </p>
                                <p><span className="font-medium">Puissance:</span> {installation.puissance} kWc</p>
                                {distance && (
                                  <p><span className="font-medium">Distance:</span> {distance.toFixed(1)} km</p>
                                )}
                                <p><span className="font-medium">PRM:</span> {installation.prm}</p>
                                
                                {installation.producteurs && (
                                  <>
                                    <p><span className="font-medium">Producteur:</span> {installation.producteurs.contact_prenom} {installation.producteurs.contact_nom}</p>
                                    <p><span className="font-medium">Contact:</span> {installation.producteurs.contact_email}</p>
                                  </>
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
                      );
                    })}
                  </MapContainer>
                </div>
                
                {!consumerData.latitude || !consumerData.longitude ? (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Position non disponible</h3>
                      <p className="text-gray-600 text-sm">
                        Votre position n'est pas renseignée.<br/>
                        Contactez le support pour mettre à jour vos données.
                      </p>
                    </div>
                  </div>
                ) : null}
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