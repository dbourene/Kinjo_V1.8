import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { BackButton } from '../components/ui/back-button';
import { supabase } from '../lib/supabase';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import PinInput from 'react-pin-input';

// Types
type UserRole = 'producteur' | 'consommateur';
type RegistrationType = 'particulier' | 'entreprise';

interface RegistrationData {
  userRole: UserRole;
  registrationType: RegistrationType;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  siret?: string;
  companyData?: any;
  contactFirstName?: string;
  contactLastName?: string;
  contactPhone?: string;
  installationData?: {
    prmNumber: string;
    installationPower: string;
    tarifBase: string;
  };
  prm?: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
}

// Email validation function that matches the database constraint
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

// Lambert 93 to WGS84 conversion function
const lambertToWGS84 = (x: number, y: number): { latitude: number; longitude: number } => {
  // Constants for Lambert 93 to WGS84 conversion
  const a = 6378137.0; // Semi-major axis
  const f = 1 / 298.257223563; // Flattening
  const e2 = 2 * f - f * f; // First eccentricity squared
  
  // Lambert 93 parameters
  const lambda0 = 3 * Math.PI / 180; // Central meridian (3°E)
  const phi0 = 46.5 * Math.PI / 180; // Reference latitude (46.5°N)
  const phi1 = 44 * Math.PI / 180; // First standard parallel (44°N)
  const phi2 = 49 * Math.PI / 180; // Second standard parallel (49°N)
  const x0 = 700000; // False easting
  const y0 = 6600000; // False northing
  
  // Calculate intermediate values
  const n = Math.log(Math.cos(phi1) / Math.cos(phi2)) / 
            Math.log(Math.tan(Math.PI/4 + phi2/2) / Math.tan(Math.PI/4 + phi1/2));
  
  const F = Math.cos(phi1) * Math.pow(Math.tan(Math.PI/4 + phi1/2), n) / n;
  
  const rho0 = a * F / Math.pow(Math.tan(Math.PI/4 + phi0/2), n);
  
  // Convert coordinates
  const dx = x - x0;
  const dy = y - y0;
  
  const rho = Math.sqrt(dx * dx + (rho0 - dy) * (rho0 - dy));
  const theta = Math.atan2(dx, rho0 - dy);
  
  const longitude = (lambda0 + theta / n) * 180 / Math.PI;
  
  const phi = 2 * Math.atan(Math.pow(a * F / rho, 1/n)) - Math.PI/2;
  const latitude = phi * 180 / Math.PI;
  
  return { latitude, longitude };
};

export const Registration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [showSmsVerification, setShowSmsVerification] = useState(false);
  const [companySearchLoading, setCompanySearchLoading] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);
  const [showPrmGuide, setShowPrmGuide] = useState(false);

  // Form data
  const [formData, setFormData] = useState<RegistrationData>({
    userRole: (searchParams.get('type') as UserRole) || 'producteur',
    registrationType: 'particulier',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    prm: '',
    adresse: '',
  });

  // Get total steps based on user type and registration type
  const getTotalSteps = () => {
    if (formData.userRole === 'producteur') {
      return formData.registrationType === 'particulier' ? 8 : 7;
    } else {
      return formData.registrationType === 'particulier' ? 7 : 6;
    }
  };

  // Check if current step can proceed
  const canProceed = () => {
    switch (currentStep) {
      case 1: // Type selection
        return formData.registrationType !== '';
      
      case 2: // PRM (for consumers) or Email (for producers)
        if (formData.userRole === 'consommateur') {
          return formData.prm && formData.prm.length === 14 && /^\d{14}$/.test(formData.prm);
        } else {
          return formData.email && validateEmail(formData.email.trim());
        }
      
      case 3: // Address (consumers) or Company/Personal (producers)
        if (formData.userRole === 'consommateur') {
          return formData.adresse && formData.adresse.trim().length > 0;
        } else {
          if (formData.registrationType === 'entreprise') {
            return formData.siret && formData.siret.length === 14 && companyData;
          } else {
            return formData.firstName && formData.lastName;
          }
        }
      
      case 4: // Email (consumers) or Contact/Phone (producers)
        if (formData.userRole === 'consommateur') {
          return formData.email && validateEmail(formData.email.trim());
        } else {
          if (formData.registrationType === 'entreprise') {
            return formData.contactFirstName && formData.contactLastName;
          } else {
            return formData.phone && formData.phone.length >= 10;
          }
        }
      
      case 5: // Personal info (consumers) or Password/Installation (producers)
        if (formData.userRole === 'consommateur') {
          return formData.firstName && formData.lastName;
        } else {
          if (formData.registrationType === 'entreprise') {
            return formData.password && formData.password.length >= 6;
          } else {
            return formData.password && formData.password.length >= 6;
          }
        }
      
      case 6: // Phone (consumers) or Installation (producers)
        if (formData.userRole === 'consommateur') {
          return formData.phone && formData.phone.length >= 10;
        } else {
          if (formData.registrationType === 'entreprise') {
            return formData.installationData?.prmNumber && 
                   formData.installationData?.installationPower &&
                   formData.installationData?.tarifBase;
          } else {
            return formData.installationData?.prmNumber && 
                   formData.installationData?.installationPower &&
                   formData.installationData?.tarifBase;
          }
        }
      
      case 7: // Password (consumers) or Final step (producers)
        if (formData.userRole === 'consommateur') {
          return formData.password && formData.password.length >= 6;
        } else {
          return true; // Final step for producers
        }
      
      case 8: // Final step for consumer particulier
        return true;
      
      default:
        return false;
    }
  };

  // Handle company search by SIRET
  const handleCompanySearch = async (siret: string) => {
    if (siret.length !== 14) return;
    
    setCompanySearchLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/insee?siret=${siret}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Entreprise non trouvée ou SIRET invalide');
      }

      const data = await response.json();
      console.log('🏢 Données entreprise récupérées:', data);
      
      if (data.etablissement) {
        setCompanyData(data.etablissement);
        setError('');
      } else {
        throw new Error('Données entreprise non disponibles');
      }
    } catch (error) {
      console.error('❌ Erreur recherche entreprise:', error);
      setError(error.message || 'Erreur lors de la recherche de l\'entreprise');
      setCompanyData(null);
    } finally {
      setCompanySearchLoading(false);
    }
  };

  // Handle SMS verification
  const handleSmsVerification = async () => {
    if (smsCode === '123456' || smsCode === '000000') {
      setShowSmsVerification(false);
      setCurrentStep(currentStep + 1);
      setSmsCode('');
    } else {
      setError('Code SMS incorrect. Utilisez 123456 pour tester.');
    }
  };

  // Handle registration
  const handleRegister = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('🚀 Début de l\'inscription:', formData);

      // Clean and validate email
      const cleanEmail = formData.email.trim().toLowerCase();
      if (!validateEmail(cleanEmail)) {
        throw new Error('Format d\'email invalide');
      }

      // Prepare user metadata for Supabase auth
      const userMetadata: any = {
        user_type: formData.userRole,
        registration_type: formData.registrationType,
        email: cleanEmail,
      };

      // Add specific data based on user type and registration type
      if (formData.userRole === 'consommateur') {
        userMetadata.prm = formData.prm;
        userMetadata.adresse = formData.adresse;
        userMetadata.latitude = formData.latitude;
        userMetadata.longitude = formData.longitude;
        
        if (formData.registrationType === 'particulier') {
          userMetadata.first_name = formData.firstName;
          userMetadata.last_name = formData.lastName;
          userMetadata.phone = formData.phone;
        } else {
          userMetadata.siret = formData.siret;
          userMetadata.contact_first_name = formData.contactFirstName;
          userMetadata.contact_last_name = formData.contactLastName;
          userMetadata.contact_phone = formData.contactPhone;
        }
      } else {
        // Producteur logic
        if (formData.registrationType === 'particulier') {
          userMetadata.first_name = formData.firstName;
          userMetadata.last_name = formData.lastName;
          userMetadata.phone = formData.phone;
        } else {
          userMetadata.siret = formData.siret;
          userMetadata.contact_first_name = formData.contactFirstName;
          userMetadata.contact_last_name = formData.contactLastName;
          userMetadata.contact_phone = formData.contactPhone;
        }
        
        if (formData.installationData) {
          userMetadata.prm_number = formData.installationData.prmNumber;
          userMetadata.installation_power = formData.installationData.installationPower;
          userMetadata.tarif_base = formData.installationData.tarifBase;
        }
      }

      console.log('📊 Métadonnées utilisateur:', userMetadata);

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
        options: {
          data: userMetadata
        }
      });

      if (authError) {
        console.error('❌ Erreur auth:', authError);
        if (authError.message.includes('already registered') || authError.message.includes('user_already_exists')) {
          throw new Error('Un compte existe déjà avec cette adresse email');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erreur lors de la création du compte utilisateur');
      }

      console.log('✅ Utilisateur créé:', authData.user.id);

      // Prepare data for database insertion
      const tableName = formData.userRole === 'producteur' ? 'producteurs' : 'consommateurs';
      
      // Determine contact info based on registration type
      const finalContactFirstName = formData.registrationType === 'entreprise' ? formData.contactFirstName : formData.firstName;
      const finalContactLastName = formData.registrationType === 'entreprise' ? formData.contactLastName : formData.lastName;
      const finalContactPhone = formData.registrationType === 'entreprise' ? formData.contactPhone : formData.phone;

      // Format phone number for database (ensure it starts with +)
      const formatPhoneForDatabase = (phone: string) => {
        if (!phone) return null;
        return phone.startsWith('+') ? phone : `+${phone}`;
      };

      const insertData: any = {
        user_id: authData.user.id,
        contact_email: cleanEmail,
        contact_prenom: finalContactFirstName,
        contact_nom: finalContactLastName,
        contact_telephone: formatPhoneForDatabase(finalContactPhone),
        statut: '1', // Inscrit sans CGU
      };

      // Add company data if available
      if (companyData) {
        insertData.siren = companyData.siren;
        insertData.siret = companyData.siret;
        insertData.dateCreationEtablissement = companyData.dateCreationEtablissement;
        insertData.trancheEffectifsEtablissement = companyData.trancheEffectifsEtablissement ? 
          parseInt(companyData.trancheEffectifsEtablissement) : null;
        insertData.activitePrincipaleRegistreMetiersEtablissement = companyData.activitePrincipaleRegistreMetiersEtablissement;
        insertData.categorieJuridiqueUniteLegale = companyData.uniteLegale?.categorieJuridiqueUniteLegale;
        insertData.denominationUniteLegale = companyData.uniteLegale?.denominationUniteLegale;
        insertData.sigleUniteLegale = companyData.uniteLegale?.sigleUniteLegale;
        insertData.activitePrincipaleUniteLegale = companyData.uniteLegale?.activitePrincipaleUniteLegale;
        insertData.nomenclatureActivitePrincipaleUniteLegale = companyData.uniteLegale?.nomenclatureActivitePrincipaleUniteLegale;
        
        // Address data
        if (companyData.adresseEtablissement) {
          const addr = companyData.adresseEtablissement;
          insertData.complementAdresseEtablissement = addr.complementAdresseEtablissement;
          insertData.numeroVoieEtablissement = addr.numeroVoieEtablissement;
          insertData.indiceRepetitionEtablissement = addr.indiceRepetitionEtablissement;
          insertData.typeVoieEtablissement = addr.typeVoieEtablissement;
          insertData.libelleVoieEtablissement = addr.libelleVoieEtablissement;
          insertData.codePostalEtablissement = addr.codePostalEtablissement;
          insertData.libelleCommuneEtablissement = addr.libelleCommuneEtablissement;
          insertData.codeCommuneEtablissement = addr.codeCommuneEtablissement;
          insertData.codeCedexEtablissement = addr.codeCedexEtablissement;
          
          // Convert Lambert coordinates to WGS84 if available
          if (addr.coordonneeLambertAbscisseEtablissement && addr.coordonneeLambertOrdonneeEtablissement) {
            const lambertX = parseFloat(addr.coordonneeLambertAbscisseEtablissement);
            const lambertY = parseFloat(addr.coordonneeLambertOrdonneeEtablissement);
            
            if (!isNaN(lambertX) && !isNaN(lambertY)) {
              const { latitude, longitude } = lambertToWGS84(lambertX, lambertY);
              insertData.latitude = latitude;
              insertData.longitude = longitude;
            }
            
            insertData.coordonneeLambertAbscisseEtablissement = lambertX;
            insertData.coordonneeLambertOrdonneeEtablissement = lambertY;
          }
        }
      } else if (formData.siret) {
        insertData.siret = formData.siret;
      }

      // Add consumer-specific data
      if (formData.userRole === 'consommateur') {
        insertData.prm = formData.prm;
        insertData.adresse = formData.adresse;
        insertData.latitude = formData.latitude;
        insertData.longitude = formData.longitude;
      }

      console.log('📊 Données à insérer dans', tableName, ':', insertData);

      // Insert into appropriate table
      const { data: insertedData, error: insertError } = await supabase
        .from(tableName)
        .insert([insertData])
        .select('id')
        .single();

      if (insertError) {
        console.error('❌ Erreur insertion:', insertError);
        throw insertError;
      }

      console.log('✅ Données insérées dans', tableName, ':', insertedData);

      // For producteurs, handle installation data
      if (formData.userRole === 'producteur' && formData.installationData && insertedData) {
        console.log('🏭 Insertion des données d\'installation...');
        
        const installationData = {
          id: crypto.randomUUID(),
          producteur_id: insertedData.id,
          prm: formData.installationData.prmNumber,
          type: null,
          puissance: parseFloat(formData.installationData.installationPower),
          tarif_base: formData.installationData.tarifBase ? parseFloat(formData.installationData.tarifBase) : null,
          created_at: new Date().toISOString()
        };

        const { data: installationResult, error: installationError } = await supabase
          .from('installations')
          .insert([installationData])
          .select('id')
          .single();

        if (installationError) {
          console.error('❌ Erreur insertion installation:', installationError);
          // Don't throw here - the main account creation was successful
          console.warn('⚠️ Compte créé mais données d\'installation non sauvegardées');
        } else {
          console.log('✅ Installation insérée:', installationResult);
        }
      }

      // Store verification data for the confirmation page
      const verificationData = {
        userType: formData.userRole,
        registrationType: formData.registrationType,
        email: cleanEmail,
        tableName,
        recordId: insertedData.id,
        timestamp: new Date().toISOString()
      };

      sessionStorage.setItem('kinjo_verification_data', JSON.stringify(verificationData));

      // Redirect to verification page
      navigate('/confirm?verification=true');

    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle next step
  const handleNext = async () => {
    if (!canProceed()) return;

    // Special handling for phone verification step (consumer particulier only)
    if (formData.userRole === 'consommateur' && 
        formData.registrationType === 'particulier' && 
        currentStep === 6) {
      setShowSmsVerification(true);
      return;
    }

    // Special handling for phone verification step (producteur particulier only)
    if (formData.userRole === 'producteur' && 
        formData.registrationType === 'particulier' && 
        currentStep === 4) {
      setShowSmsVerification(true);
      return;
    }

    // For address step in consumer flow, try to geocode the address
    if (formData.userRole === 'consommateur' && currentStep === 3 && formData.adresse) {
      try {
        // Simple geocoding using a free service (you might want to use a more robust solution)
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.adresse)}&limit=1`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setFormData(prev => ({
            ...prev,
            latitude: parseFloat(lat),
            longitude: parseFloat(lon)
          }));
          console.log('📍 Coordonnées géocodées:', { latitude: lat, longitude: lon });
        }
      } catch (error) {
        console.warn('⚠️ Erreur géocodage:', error);
        // Continue without coordinates if geocoding fails
      }
    }

    setCurrentStep(currentStep + 1);
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render step content
  const renderStepContent = () => {
    const totalSteps = getTotalSteps();

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Type d'inscription</h2>
              <p className="text-gray-600">Êtes-vous un particulier ou une entreprise ?</p>
            </div>
            
            <div className="space-y-4">
              <Card 
                className={`p-4 cursor-pointer border-2 transition-colors ${
                  formData.registrationType === 'particulier' 
                    ? 'border-[#92C55E] bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, registrationType: 'particulier' }))}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.registrationType === 'particulier' 
                      ? 'border-[#92C55E] bg-[#92C55E]' 
                      : 'border-gray-300'
                  }`}>
                    {formData.registrationType === 'particulier' && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">Particulier</h3>
                    <p className="text-sm text-gray-600">Inscription en tant que personne physique</p>
                  </div>
                </div>
              </Card>

              <Card 
                className={`p-4 cursor-pointer border-2 transition-colors ${
                  formData.registrationType === 'entreprise' 
                    ? 'border-[#92C55E] bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, registrationType: 'entreprise' }))}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.registrationType === 'entreprise' 
                      ? 'border-[#92C55E] bg-[#92C55E]' 
                      : 'border-gray-300'
                  }`}>
                    {formData.registrationType === 'entreprise' && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">Entreprise</h3>
                    <p className="text-sm text-gray-600">Inscription en tant que personne morale</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 2:
        if (formData.userRole === 'consommateur') {
          // PRM input for consumers
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Votre PRM</h2>
                <p className="text-gray-600">Saisissez votre numéro PRM (14 chiffres)</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro PRM *
                  </label>
                  <Input
                    type="text"
                    placeholder="12345678901234"
                    value={formData.prm}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 14);
                      setFormData(prev => ({ ...prev, prm: value }));
                    }}
                    className="text-center text-lg tracking-wider"
                    maxLength={14}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Le PRM est un numéro à 14 chiffres qui identifie votre point de livraison
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowPrmGuide(!showPrmGuide)}
                  className="w-full"
                >
                  {showPrmGuide ? 'Masquer' : 'Où trouver mon PRM ?'}
                </Button>

                {showPrmGuide && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-3">Où trouver votre PRM ?</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-blue-700 mb-2">Sur votre facture d'électricité</h5>
                        <p className="text-sm text-blue-600">
                          Le PRM figure sur toutes vos factures d'électricité, généralement dans la section 
                          "Caractéristiques de votre contrat" ou "Références de votre contrat".
                        </p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-blue-700 mb-2">Sur votre contrat ENEDIS</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="text-center">
                            <img 
                              src={import.meta.env.BASE_URL + "ENEDIS_CA_inf36kVA.png"}
                              alt="Contrat ENEDIS ≤36kVA" 
                              className="w-full max-w-xs mx-auto rounded border" />
                            <p className="text-xs text-gray-600 mt-1">Contrat inférieur ou égal à 36kVA</p>
                          </div>
                          <div className="text-center">
                            <img 
                              src={import.meta.env.BASE_URL + "ENEDIS_CARDi_sup36kVA.png"}
                              alt="Contrat ENEDIS >36kVA" 
                              className="w-full max-w-xs mx-auto rounded border" />
                            <p className="text-xs text-gray-600 mt-1">Contrat supérieur à 36kVA</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          );
        } else {
          // Email input for producers
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Votre email</h2>
                <p className="text-gray-600">Saisissez votre adresse email</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email *
                </label>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
          );
        }

      case 3:
        if (formData.userRole === 'consommateur') {
          // Address input for consumers
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Votre adresse</h2>
                <p className="text-gray-600">Saisissez l'adresse de votre point de livraison</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse complète *
                </label>
                <Input
                  type="text"
                  placeholder="123 Rue de la République, 75001 Paris"
                  value={formData.adresse}
                  onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cette adresse sera utilisée pour vous connecter avec des producteurs locaux
                </p>
              </div>
            </div>
          );
        } else {
          // Company/Personal info for producers
          if (formData.registrationType === 'entreprise') {
            return (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Informations entreprise</h2>
                  <p className="text-gray-600">Saisissez le SIRET de votre entreprise</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro SIRET *
                    </label>
                    <Input
                      type="text"
                      placeholder="12345678901234"
                      value={formData.siret || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 14);
                        setFormData(prev => ({ ...prev, siret: value }));
                        if (value.length === 14) {
                          handleCompanySearch(value);
                        } else {
                          setCompanyData(null);
                        }
                      }}
                      maxLength={14}
                    />
                    {companySearchLoading && (
                      <p className="text-sm text-blue-600 mt-1">🔍 Recherche en cours...</p>
                    )}
                  </div>

                  {companyData && (
                    <Card className="p-4 bg-green-50 border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">✅ Entreprise trouvée</h4>
                      <div className="space-y-1 text-sm text-green-700">
                        <p><strong>Raison sociale :</strong> {companyData.uniteLegale?.denominationUniteLegale}</p>
                        <p><strong>Adresse :</strong> {companyData.adresseEtablissement?.numeroVoieEtablissement} {companyData.adresseEtablissement?.typeVoieEtablissement} {companyData.adresseEtablissement?.libelleVoieEtablissement}, {companyData.adresseEtablissement?.codePostalEtablissement} {companyData.adresseEtablissement?.libelleCommuneEtablissement}</p>
                        <p><strong>Activité :</strong> {companyData.activitePrincipaleRegistreMetiersEtablissement}</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            );
          } else {
            return (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Vos informations</h2>
                  <p className="text-gray-600">Saisissez vos nom et prénom</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <Input
                      type="text"
                      placeholder="Jean"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <Input
                      type="text"
                      placeholder="Dupont"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            );
          }
        }

      case 4:
        if (formData.userRole === 'consommateur') {
          // Email for consumers
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Votre email</h2>
                <p className="text-gray-600">Saisissez votre adresse email</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email *
                </label>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
          );
        } else {
          // Contact info for producer entreprise or phone for producer particulier
          if (formData.registrationType === 'entreprise') {
            return (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Personne de contact</h2>
                  <p className="text-gray-600">Qui sera la personne de contact pour cette entreprise ?</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom du contact *
                    </label>
                    <Input
                      type="text"
                      placeholder="Jean"
                      value={formData.contactFirstName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactFirstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du contact *
                    </label>
                    <Input
                      type="text"
                      placeholder="Dupont"
                      value={formData.contactLastName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactLastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone du contact
                  </label>
                  <PhoneInput
                    country={'fr'}
                    value={formData.contactPhone || ''}
                    onChange={(phone) => setFormData(prev => ({ ...prev, contactPhone: phone }))}
                    inputStyle={{
                      width: '100%',
                      height: '40px',
                      fontSize: '16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  />
                </div>
              </div>
            );
          } else {
            return (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Votre téléphone</h2>
                  <p className="text-gray-600">Nous allons vous envoyer un code de vérification</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de téléphone *
                  </label>
                  <PhoneInput
                    country={'fr'}
                    value={formData.phone}
                    onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                    inputStyle={{
                      width: '100%',
                      height: '40px',
                      fontSize: '16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  />
                </div>

                {showSmsVerification && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-3">📱 Vérification SMS</h4>
                    <p className="text-sm text-blue-600 mb-4">
                      Saisissez le code reçu par SMS au {formData.phone}
                    </p>
                    <div className="flex justify-center mb-4">
                      <PinInput
                        length={6}
                        onChange={(value) => setSmsCode(value)}
                        type="numeric"
                        inputMode="number"
                        style={{ padding: '10px' }}
                        inputStyle={{
                          borderColor: '#d1d5db',
                          borderRadius: '6px',
                          margin: '0 4px'
                        }}
                        inputFocusStyle={{ borderColor: '#92C55E' }}
                        onComplete={(value) => setSmsCode(value)}
                        autoSelect={true}
                        regexCriteria={/^[ A-Za-z0-9_@./#&+-]*$/}
                      />
                    </div>
                    <p className="text-xs text-blue-500 mb-4">
                      💡 Code de test : 123456 ou 000000
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSmsVerification}
                        disabled={smsCode.length !== 6}
                        className="flex-1 bg-[#92C55E] hover:bg-[#83b150]"
                      >
                        Vérifier
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowSmsVerification(false)}
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            );
          }
        }

      case 5:
        if (formData.userRole === 'consommateur') {
          // Personal info for consumers
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Vos informations</h2>
                <p className="text-gray-600">Saisissez vos nom et prénom</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <Input
                    type="text"
                    placeholder="Jean"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <Input
                    type="text"
                    placeholder="Dupont"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          );
        } else {
          // Password for producers
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Mot de passe</h2>
                <p className="text-gray-600">Choisissez un mot de passe sécurisé</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 caractères
                </p>
              </div>
            </div>
          );
        }

      case 6:
        if (formData.userRole === 'consommateur') {
          // Phone for consumers
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Votre téléphone</h2>
                <p className="text-gray-600">Nous allons vous envoyer un code de vérification</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone *
                </label>
                <PhoneInput
                  country={'fr'}
                  value={formData.phone}
                  onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                  inputStyle={{
                    width: '100%',
                    height: '40px',
                    fontSize: '16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                />
              </div>

              {showSmsVerification && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3">📱 Vérification SMS</h4>
                  <p className="text-sm text-blue-600 mb-4">
                    Saisissez le code reçu par SMS au {formData.phone}
                  </p>
                  <div className="flex justify-center mb-4">
                    <PinInput
                      length={6}
                      onChange={(value) => setSmsCode(value)}
                      type="numeric"
                      inputMode="number"
                      style={{ padding: '10px' }}
                      inputStyle={{
                        borderColor: '#d1d5db',
                        borderRadius: '6px',
                        margin: '0 4px'
                      }}
                      inputFocusStyle={{ borderColor: '#92C55E' }}
                      onComplete={(value) => setSmsCode(value)}
                      autoSelect={true}
                      regexCriteria={/^[ A-Za-z0-9_@./#&+-]*$/}
                    />
                  </div>
                  <p className="text-xs text-blue-500 mb-4">
                    💡 Code de test : 123456 ou 000000
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSmsVerification}
                      disabled={smsCode.length !== 6}
                      className="flex-1 bg-[#92C55E] hover:bg-[#83b150]"
                    >
                      Vérifier
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowSmsVerification(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          );
        } else {
          // Installation for producers
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Votre installation</h2>
                <p className="text-gray-600">Informations sur votre installation de production</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro PRM *
                  </label>
                  <Input
                    type="text"
                    placeholder="12345678901234"
                    value={formData.installationData?.prmNumber || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 14);
                      setFormData(prev => ({
                        ...prev,
                        installationData: {
                          ...prev.installationData,
                          prmNumber: value,
                          installationPower: prev.installationData?.installationPower || '',
                          tarifBase: prev.installationData?.tarifBase || ''
                        }
                      }));
                    }}
                    className="text-center text-lg tracking-wider"
                    maxLength={14}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puissance installée (kWc) *
                  </label>
                  <Input
                    type="number"
                    placeholder="9.0"
                    step="0.1"
                    min="0"
                    value={formData.installationData?.installationPower || ''}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        installationData: {
                          ...prev.installationData,
                          prmNumber: prev.installationData?.prmNumber || '',
                          installationPower: e.target.value,
                          tarifBase: prev.installationData?.tarifBase || ''
                        }
                      }));
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarif de vente (ct€/kWh) *
                  </label>
                  <Input
                    type="number"
                    placeholder="13.5"
                    step="0.1"
                    min="0"
                    value={formData.installationData?.tarifBase || ''}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        installationData: {
                          ...prev.installationData,
                          prmNumber: prev.installationData?.prmNumber || '',
                          installationPower: prev.installationData?.installationPower || '',
                          tarifBase: e.target.value
                        }
                      }));
                    }}
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowPrmGuide(!showPrmGuide)}
                  className="w-full"
                >
                  {showPrmGuide ? 'Masquer' : 'Où trouver mon PRM ?'}
                </Button>

                {showPrmGuide && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-3">Où trouver votre PRM ?</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-blue-700 mb-2">Sur votre facture d'électricité</h5>
                        <p className="text-sm text-blue-600">
                          Le PRM figure sur toutes vos factures d'électricité, généralement dans la section 
                          "Caractéristiques de votre contrat" ou "Références de votre contrat".
                        </p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-blue-700 mb-2">Sur votre contrat ENEDIS</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="text-center">
                            <img 
                              src={import.meta.env.BASE_URL + "ENEDIS_CA_inf36kVA.png"}
                              alt="Contrat ENEDIS ≤36kVA" 
                              className="w-full max-w-xs mx-auto rounded border" />
                            <p className="text-xs text-gray-600 mt-1">Contrat inférieur ou égal à 36kVA</p>
                          </div>
                          <div className="text-center">
                            <img 
                              src={import.meta.env.BASE_URL + "ENEDIS_CARDi_sup36kVA.png"}
                              alt="Contrat ENEDIS >36kVA" 
                              className="w-full max-w-xs mx-auto rounded border" />
                            <p className="text-xs text-gray-600 mt-1">Contrat supérieur à 36kVA</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          );
        }

      case 7:
        if (formData.userRole === 'consommateur') {
          // Password for consumers
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Mot de passe</h2>
                <p className="text-gray-600">Choisissez un mot de passe sécurisé</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 caractères
                </p>
              </div>
            </div>
          );
        } else {
          // Final step for producers
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Récapitulatif</h2>
                <p className="text-gray-600">Vérifiez vos informations avant de créer votre compte</p>
              </div>

              <Card className="p-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800">Type d'inscription</h4>
                  <p className="text-gray-600">{formData.userRole} - {formData.registrationType}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800">Email</h4>
                  <p className="text-gray-600">{formData.email}</p>
                </div>

                {formData.registrationType === 'particulier' ? (
                  <div>
                    <h4 className="font-medium text-gray-800">Nom et prénom</h4>
                    <p className="text-gray-600">{formData.firstName} {formData.lastName}</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-800">Entreprise</h4>
                      <p className="text-gray-600">{companyData?.uniteLegale?.denominationUniteLegale}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Contact</h4>
                      <p className="text-gray-600">{formData.contactFirstName} {formData.contactLastName}</p>
                    </div>
                  </>
                )}

                {formData.installationData && (
                  <div>
                    <h4 className="font-medium text-gray-800">Installation</h4>
                    <p className="text-gray-600">
                      PRM: {formData.installationData.prmNumber}<br/>
                      Puissance: {formData.installationData.installationPower} kWc<br/>
                      Tarif: {formData.installationData.tarifBase} ct€/kWh
                    </p>
                  </div>
                )}
              </Card>
            </div>
          );
        }

      case 8:
        // Final step for consumer particulier
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Récapitulatif</h2>
              <p className="text-gray-600">Vérifiez vos informations avant de créer votre compte</p>
            </div>

            <Card className="p-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-800">Type d'inscription</h4>
                <p className="text-gray-600">{formData.userRole} - {formData.registrationType}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-800">PRM</h4>
                <p className="text-gray-600">{formData.prm}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-800">Adresse</h4>
                <p className="text-gray-600">{formData.adresse}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-800">Email</h4>
                <p className="text-gray-600">{formData.email}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-800">Nom et prénom</h4>
                <p className="text-gray-600">{formData.firstName} {formData.lastName}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-800">Téléphone</h4>
                <p className="text-gray-600">{formData.phone}</p>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const totalSteps = getTotalSteps();
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="min-h-screen bg-white">
      <div className="h-[30vh] bg-gradient-to-b from-[#1D4C3C] to-[#92C55E] rounded-b-[160px] flex items-center justify-center relative">
        <div className="text-center">
          <img 
            src={import.meta.env.BASE_URL + "Fichier 1@2x 5 (1).png"}
            alt="Kinjo Logo" 
            className="w-16 h-16 mx-auto mb-4 invert"
          />
          <h1 className="text-3xl font-parkisans font-bold text-white mb-2">
            Inscription {formData.userRole}
          </h1>
          <p className="text-white/80">
            Étape {currentStep} sur {totalSteps}
          </p>
        </div>
      </div>
      
      <div className="max-w-md mx-auto px-4 -mt-8 relative z-10">
        <Card className="p-6 bg-white rounded-2xl shadow-lg">
          <div className="mb-6">
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {renderStepContent()}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && !showSmsVerification && (
              <BackButton onClick={handlePrevious} />
            )}
            
            <div className="flex-1 flex justify-end">
              {!showSmsVerification && (
                <Button
                  onClick={isLastStep ? handleRegister : handleNext}
                  disabled={!canProceed() || isLoading}
                  className="bg-[#92C55E] text-white rounded-xl h-12 px-8 hover:bg-[#83b150] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Création...</span>
                    </div>
                  ) : isLastStep ? (
                    'Créer mon compte'
                  ) : (
                    'Suivant'
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};