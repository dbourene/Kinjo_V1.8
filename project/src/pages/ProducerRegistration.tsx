import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { emailService } from '../lib/email-service';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { BackButton } from '../components/ui/back-button';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Annexe21Service } from '../services/annexe21-service';

interface ProducerFormData {
  userType: 'producteur';
  registrationType: 'particulier' | 'entreprise';
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  siret: string;
  companyData: any;
  prm: string;
  power: string;
  tariff: string;
  address: string;
  coordinates: { latitude: number; longitude: number } | null;
}

// ✅ FONCTION UTILITAIRE POUR RECHERCHE D'ADRESSE
const searchAddressCoordinates = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    console.log('🔍 Recherche de coordonnées pour l\'adresse:', address);
    
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const coordinates = {
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0]
      };
      
      console.log('✅ Coordonnées trouvées:', coordinates);
      return coordinates;
    }
    
    console.warn('⚠️ Aucune coordonnée trouvée pour cette adresse');
    return null;
    
  } catch (error) {
    console.error('❌ Erreur lors de la recherche de coordonnées:', error);
    return null;
  }
};

// ✅ COMPOSANTS D'ÉTAPES POUR PRODUCTEURS
const TypeSelectionStep = ({ formData, updateFormData, handleNext }: any) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-center">
      Vous êtes un producteur
    </h2>
    <div className="space-y-3">
      <button
        onClick={() => updateFormData('registrationType', 'particulier')}
        className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
          formData.registrationType === 'particulier'
            ? 'border-[#92C55E] bg-green-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="font-medium">Particulier</div>
        <div className="text-sm text-gray-600">Personne physique</div>
      </button>
      <button
        onClick={() => updateFormData('registrationType', 'entreprise')}
        className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
          formData.registrationType === 'entreprise'
            ? 'border-[#92C55E] bg-green-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="font-medium">Entreprise</div>
        <div className="text-sm text-gray-600">Personne morale</div>
      </button>
    </div>
    <Button
      onClick={handleNext}
      disabled={!formData.registrationType}
      className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
    >
      Continuer
    </Button>
  </div>
);

const EmailStep = ({ formData, updateFormData, handleNext }: any) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-center">Votre adresse email</h2>
    <Input
      type="email"
      value={formData.email}
      onChange={(e) => updateFormData('email', e.target.value)}
      placeholder="votre.email@exemple.com"
      className="w-full"
    />
    <Button
      onClick={handleNext}
      disabled={!formData.email || !formData.email.includes('@')}
      className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
    >
      Continuer
    </Button>
  </div>
);

const PersonalInfoStep = ({ formData, updateFormData, handleNext }: any) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-center">Vos informations</h2>
    <Input
      value={formData.firstName}
      onChange={(e) => updateFormData('firstName', e.target.value)}
      placeholder="Prénom"
      className="w-full"
    />
    <Input
      value={formData.lastName}
      onChange={(e) => updateFormData('lastName', e.target.value)}
      placeholder="Nom"
      className="w-full"
    />
    <Button
      onClick={handleNext}
      disabled={!formData.firstName || !formData.lastName}
      className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
    >
      Continuer
    </Button>
  </div>
);

const PhoneStep = ({ formData, updateFormData, handleNext }: any) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-center">Votre téléphone</h2>
    <PhoneInput
      country={'fr'}
      value={formData.phone}
      onChange={(phone) => updateFormData('phone', `+${phone}`)}
      inputClass="w-full"
      containerClass="w-full"
    />
    <Button
      onClick={handleNext}
      disabled={!formData.phone}
      className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
    >
      Continuer
    </Button>
  </div>
);

const AddressStep = ({ formData, updateFormData, handleNext }: any) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      
      if (data.features) {
        setSuggestions(data.features);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresse:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.address) {
        searchAddresses(formData.address);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData.address]);

  const handleAddressSelect = (feature: any) => {
    const address = feature.properties.label;
    const coordinates = {
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0]
    };
    
    updateFormData('address', address);
    updateFormData('coordinates', coordinates);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center">Adresse de votre installation</h2>
      
      <div className="relative">
        <Input
          value={formData.address}
          onChange={(e) => {
            updateFormData('address', e.target.value);
            if (!e.target.value) {
              updateFormData('coordinates', null);
            }
          }}
          placeholder="Tapez votre adresse..."
          className="w-full"
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#92C55E]"></div>
          </div>
        )}
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((feature: any, index) => (
              <button
                key={index}
                onClick={() => handleAddressSelect(feature)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">
                  {feature.properties.label}
                </div>
                <div className="text-sm text-gray-500">
                  {feature.properties.context}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {formData.coordinates && (
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-green-700">Adresse localisée</span>
          </div>
        </div>
      )}

      <Button
        onClick={handleNext}
        disabled={!formData.address || !formData.coordinates}
        className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
      >
        Continuer
      </Button>
    </div>
  );
};

const PasswordStep = ({ formData, updateFormData, handleNext, handleFinalSubmit, isLastStep, loading }: any) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-center">Votre mot de passe</h2>
    <Input
      type="password"
      value={formData.password}
      onChange={(e) => updateFormData('password', e.target.value)}
      placeholder="Mot de passe"
      className="w-full"
    />
    <Input
      type="password"
      value={formData.confirmPassword}
      onChange={(e) => updateFormData('confirmPassword', e.target.value)}
      placeholder="Confirmer le mot de passe"
      className="w-full"
    />
    <Button
      onClick={isLastStep ? handleFinalSubmit : handleNext}
      disabled={!formData.password || formData.password !== formData.confirmPassword || loading}
      className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
    >
      {loading ? 'Création en cours...' : (isLastStep ? 'Créer mon compte' : 'Continuer')}
    </Button>
  </div>
);

const SiretStep = ({ formData, updateFormData, handleNext, companyLoading, setCompanyLoading, setError, supabase }: any) => {
  const handleSiretLookup = async () => {
    if (formData.siret.length !== 14) {
      setError('Le SIRET doit contenir 14 chiffres');
      return;
    }

    setCompanyLoading(true);
    setError('');

    try {
      const response = await supabase.functions.invoke('insee', {
        body: { siret: formData.siret }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.etablissement) {
        const companyData = response.data.etablissement;
        updateFormData('companyData', companyData);
        
        // 🔧 CORRECTION: Utiliser l'API adresse pour obtenir les coordonnées correctes
        console.log('🏢 Entreprise trouvée, recherche des coordonnées...');
        
        // Construire l'adresse complète depuis les données INSEE
        const addr = companyData.adresseEtablissement;
        if (addr) {
          const addressParts = [
            addr.numeroVoieEtablissement,
            addr.typeVoieEtablissement,
            addr.libelleVoieEtablissement,
            addr.codePostalEtablissement,
            addr.libelleCommuneEtablissement
          ].filter(Boolean);
          
          const fullAddress = addressParts.join(' ');
          console.log('📍 Adresse construite:', fullAddress);
          
          // Rechercher les coordonnées avec l'API adresse
          const coordinates = await searchAddressCoordinates(fullAddress);
          
          if (coordinates) {
            console.log('✅ Coordonnées trouvées via API adresse:', coordinates);
            updateFormData('address', fullAddress);
            updateFormData('coordinates', coordinates);
          } else {
            console.warn('⚠️ Impossible de géolocaliser l\'adresse de l\'entreprise');
            updateFormData('address', fullAddress);
            updateFormData('coordinates', null);
          }
        }
      } else {
        throw new Error('Entreprise non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche SIRET:', error);
      setError('Erreur lors de la recherche de l\'entreprise');
    } finally {
      setCompanyLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center">Numéro de SIRET</h2>
      <Input
        value={formData.siret}
        onChange={(e) => updateFormData('siret', e.target.value.replace(/\D/g, ''))}
        placeholder="14 chiffres"
        maxLength={14}
        className="w-full"
      />
      
      {!formData.companyData && (
        <Button
          onClick={handleSiretLookup}
          disabled={formData.siret.length !== 14 || companyLoading}
          className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
        >
          {companyLoading ? 'Recherche...' : 'Rechercher l\'entreprise'}
        </Button>
      )}

      {formData.companyData && (
        <div className="space-y-3">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800">
              {formData.companyData.uniteLegale?.denominationUniteLegale || 'Entreprise trouvée'}
            </h3>
            <p className="text-sm text-green-600">
              {formData.address || 'Adresse en cours de géolocalisation...'}
            </p>
            {formData.coordinates && (
              <div className="flex items-center space-x-2 mt-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-green-700">Adresse géolocalisée</span>
              </div>
            )}
          </div>
          <Button
            onClick={handleNext}
            className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
          >
            Continuer
          </Button>
        </div>
      )}
    </div>
  );
};

const ContactStep = ({ formData, updateFormData, handleNext }: any) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-center">Personne de contact</h2>
    <Input
      value={formData.firstName}
      onChange={(e) => updateFormData('firstName', e.target.value)}
      placeholder="Prénom"
      className="w-full"
    />
    <Input
      value={formData.lastName}
      onChange={(e) => updateFormData('lastName', e.target.value)}
      placeholder="Nom"
      className="w-full"
    />
    <PhoneInput
      country={'fr'}
      value={formData.phone}
      onChange={(phone) => updateFormData('phone', `+${phone}`)}
      inputClass="w-full"
      containerClass="w-full"
    />
    <Button
      onClick={handleNext}
      disabled={!formData.firstName || !formData.lastName}
      className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
    >
      Continuer
    </Button>
  </div>
);

const InstallationStep = ({ formData, updateFormData, handleNext }: any) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-center">Votre installation</h2>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Numéro PRM (14 chiffres)
      </label>
      <Input
        value={formData.prm}
        onChange={(e) => updateFormData('prm', e.target.value.replace(/\D/g, ''))}
        placeholder="12345678901234"
        maxLength={14}
        className="w-full"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Puissance installée (kWc)
      </label>
      <Input
        type="number"
        step="0.1"
        value={formData.power}
        onChange={(e) => updateFormData('power', e.target.value)}
        placeholder="9.0"
        className="w-full"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tarif de vente (ct€/kWh)
      </label>
      <Input
        type="number"
        step="0.1"
        value={formData.tariff}
        onChange={(e) => updateFormData('tariff', e.target.value)}
        placeholder="13.4"
        className="w-full"
      />
    </div>

    <Button
      onClick={handleNext}
      disabled={!formData.prm || !formData.power || !formData.tariff}
      className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
    >
      Continuer
    </Button>
  </div>
);

const FinalStep = ({ formData, handleFinalSubmit, loading }: any) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-center">Finalisation</h2>
    <div className="text-center space-y-4">
      <p className="text-gray-600">
        Votre inscription est prête à être finalisée.
        <span className="block mt-2 text-sm">
          L'Annexe 21 sera automatiquement générée après validation.
        </span>
      </p>
      <Button
        onClick={handleFinalSubmit}
        disabled={loading}
        className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
      >
        {loading ? 'Création en cours...' : 'Créer mon compte'}
      </Button>
    </div>
  </div>
);

export const ProducerRegistration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companyLoading, setCompanyLoading] = useState(false);

  const [formData, setFormData] = useState<ProducerFormData>({
    userType: 'producteur',
    registrationType: 'particulier',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    siret: '',
    companyData: null,
    prm: '',
    power: '',
    tariff: '',
    address: '',
    coordinates: null
  });

  const updateFormData = useCallback((field: keyof ProducerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Configuration des étapes pour producteurs
  const getStepConfig = () => {
    if (formData.registrationType === 'particulier') {
      return [
        { title: 'Type d\'inscription', component: 'TypeSelectionStep' },
        { title: 'Votre email', component: 'EmailStep' },
        { title: 'Vos informations', component: 'PersonalInfoStep' },
        { title: 'Votre téléphone', component: 'PhoneStep' },
        { title: 'Votre adresse', component: 'AddressStep' },
        { title: 'Votre mot de passe', component: 'PasswordStep' },
        { title: 'Votre installation', component: 'InstallationStep' },
        { title: 'Finalisation', component: 'FinalStep' }
      ];
    } else {
      return [
        { title: 'Type d\'inscription', component: 'TypeSelectionStep' },
        { title: 'Numéro de SIRET', component: 'SiretStep' },
        { title: 'Contact', component: 'ContactStep' },
        { title: 'Votre email', component: 'EmailStep' },
        { title: 'Votre mot de passe', component: 'PasswordStep' },
        { title: 'Votre installation', component: 'InstallationStep' },
        { title: 'Finalisation', component: 'FinalStep' }
      ];
    }
  };

  const stepConfig = getStepConfig();
  const totalSteps = stepConfig.length;
  const progress = (currentStep / totalSteps) * 100;

  const validateCurrentStep = (): boolean => {
    const currentStepComponent = stepConfig[currentStep - 1].component;
    
    switch (currentStepComponent) {
      case 'TypeSelectionStep':
        return formData.registrationType !== '';
      case 'EmailStep':
        return formData.email !== '' && formData.email.includes('@');
      case 'PersonalInfoStep':
        return formData.firstName !== '' && formData.lastName !== '';
      case 'PhoneStep':
        return formData.phone !== '';
      case 'AddressStep':
        return formData.address !== '' && formData.coordinates !== null;
      case 'PasswordStep':
        return formData.password !== '' && formData.password === formData.confirmPassword;
      case 'SiretStep':
        return formData.siret !== '' && formData.companyData !== null;
      case 'ContactStep':
        return formData.firstName !== '' && formData.lastName !== '';
      case 'InstallationStep':
        return formData.prm !== '' && formData.power !== '' && formData.tariff !== '';
      default:
        return true;
    }
  };

  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      nextStep();
    } else {
      setError('Veuillez remplir tous les champs requis');
    }
  }, [nextStep, validateCurrentStep]);

  // Fonction pour calculer le titulaire de l'installation
  const calculateTitulaire = (): string => {
    if (formData.registrationType === 'entreprise' && formData.companyData) {
      if (formData.companyData.uniteLegale?.denominationUniteLegale) {
        return formData.companyData.uniteLegale.denominationUniteLegale;
      }
      if (formData.companyData.adresseEtablissement?.libelleVoieEtablissement) {
        return formData.companyData.adresseEtablissement.libelleVoieEtablissement;
      }
    }
    return `${formData.firstName} ${formData.lastName}`;
  };

  // 🔧 CORRECTION: Fonction pour construire l'adresse complète
  const buildFullAddress = (): string => {
    // Pour les entreprises, utiliser l'adresse déjà construite et géolocalisée
    if (formData.registrationType === 'entreprise' && formData.address) {
      return formData.address;
    }
    // Pour les particuliers, utiliser l'adresse saisie
    return formData.address || '';
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🚀 Début de l\'inscription producteur finale');

      // 1. Créer l'utilisateur avec Supabase Auth
      console.log('👤 Création de l\'utilisateur...');
      const { data: authData, error: authError } = await emailService.signUp(
        formData.email,
        formData.password,
        {
          emailRedirectTo: `${window.location.origin}/confirm?verification=true`,
          data: {
            user_type: formData.userType,
            registration_type: formData.registrationType,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            siret: formData.siret
          }
        }
      );

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erreur lors de la création de l\'utilisateur');
      }

      console.log('✅ Utilisateur créé:', authData.user.id);

      // 2. Préparer les données producteur
      console.log('🏭 Traitement inscription producteur...');

      // 🔧 CORRECTION: Utiliser les coordonnées déjà obtenues via l'API adresse
      const coordinates = formData.coordinates; // Plus de transformation Lambert
      const fullAddress = buildFullAddress();
      const titulaire = calculateTitulaire();

      console.log('📍 Coordonnées finales:', coordinates);
      console.log('🏠 Adresse finale:', fullAddress);

      // 2a. Insérer dans la table producteurs
      const producteurData = {
        id: crypto.randomUUID(),
        user_id: authData.user.id,
        contact_email: formData.email,
        contact_prenom: formData.firstName,
        contact_nom: formData.lastName,
        contact_telephone: formData.phone || null,
        statut: '1',
        adresse: fullAddress,
        latitude: coordinates?.latitude || null,
        longitude: coordinates?.longitude || null,
        ...(formData.registrationType === 'entreprise' && formData.companyData && {
          siret: formData.siret,
          siren: formData.companyData.uniteLegale?.siren,
          dateCreationEtablissement: formData.companyData.dateCreationEtablissement,
          trancheEffectifsEtablissement: formData.companyData.trancheEffectifsEtablissement,
          activitePrincipaleRegistreMetiersEtablissement: formData.companyData.activitePrincipaleRegistreMetiersEtablissement,
          categorieJuridiqueUniteLegale: formData.companyData.uniteLegale?.categorieJuridiqueUniteLegale,
          denominationUniteLegale: formData.companyData.uniteLegale?.denominationUniteLegale,
          sigleUniteLegale: formData.companyData.uniteLegale?.sigleUniteLegale,
          activitePrincipaleUniteLegale: formData.companyData.uniteLegale?.activitePrincipaleUniteLegale,
          nomenclatureActivitePrincipaleUniteLegale: formData.companyData.uniteLegale?.nomenclatureActivitePrincipaleUniteLegale,
          complementAdresseEtablissement: formData.companyData.adresseEtablissement?.complementAdresseEtablissement,
          numeroVoieEtablissement: formData.companyData.adresseEtablissement?.numeroVoieEtablissement,
          indiceRepetitionEtablissement: formData.companyData.adresseEtablissement?.indiceRepetitionEtablissement,
          typeVoieEtablissement: formData.companyData.adresseEtablissement?.typeVoieEtablissement,
          libelleVoieEtablissement: formData.companyData.adresseEtablissement?.libelleVoieEtablissement,
          codePostalEtablissement: formData.companyData.adresseEtablissement?.codePostalEtablissement,
          libelleCommuneEtablissement: formData.companyData.adresseEtablissement?.libelleCommuneEtablissement,
          codeCommuneEtablissement: formData.companyData.adresseEtablissement?.codeCommuneEtablissement,
          codeCedexEtablissement: formData.companyData.adresseEtablissement?.codeCedexEtablissement,
          coordonneeLambertAbscisseEtablissement: formData.companyData.adresseEtablissement?.coordonneeLambertAbscisseEtablissement,
          coordonneeLambertOrdonneeEtablissement: formData.companyData.adresseEtablissement?.coordonneeLambertOrdonneeEtablissement
        })
      };

      console.log('📝 Insertion producteur:', producteurData);

      const { data: producteur, error: producteurError } = await supabase
        .from('producteurs')
        .insert([producteurData])
        .select()
        .single();

      if (producteurError) {
        console.error('❌ Erreur insertion producteur:', producteurError);
        throw new Error(`Erreur lors de l'insertion du producteur: ${producteurError.message}`);
      }

      console.log('✅ Producteur inséré:', producteur);

      // 2b. Insérer dans la table installations avec titulaire
      const installationData = {
        id: crypto.randomUUID(),
        producteur_id: producteur.id,
        prm: formData.prm,
        puissance: parseFloat(formData.power),
        tarif_base: parseFloat(formData.tariff),
        titulaire: titulaire,
        adresse: fullAddress,
        latitude: coordinates?.latitude || null,
        longitude: coordinates?.longitude || null,
        type: 'Solaire'
      };

      console.log('🔌 Insertion installation:', installationData);

      const { data: installation, error: installationError } = await supabase
        .from('installations')
        .insert([installationData])
        .select()
        .single();

      if (installationError) {
        console.error('❌ Erreur insertion installation:', installationError);
        throw new Error(`Erreur lors de l'insertion de l'installation: ${installationError.message}`);
      }

      console.log('✅ Installation insérée:', installation);

      // 2c. Créer l'opération ACC et générer l'Annexe 21
      console.log('🏭 Création de l\'opération ACC...');
      
      try {
        const { operationId, annexe21Url } = await Annexe21Service.generateCompleteAnnexe21(
          installation.id,
          {
            id: producteur.id,
            contact_email: producteur.contact_email,
            contact_nom: producteur.contact_nom,
            contact_prenom: producteur.contact_prenom,
            siret: producteur.siret,
            denominationUniteLegale: producteur.denominationUniteLegale,
            libelleVoieEtablissement: producteur.libelleVoieEtablissement,
            registrationType: formData.registrationType
          }
        );

        console.log('✅ Opération créée:', operationId);
        console.log('✅ Annexe21 générée:', annexe21Url);

        sessionStorage.setItem('kinjo_verification_data', JSON.stringify({
          userType: formData.userType,
          registrationType: formData.registrationType,
          email: formData.email,
          tableName: 'producteurs',
          recordId: producteur.id,
          installationId: installation.id,
          operationId: operationId,
          annexe21Url: annexe21Url
        }));

      } catch (annexeError) {
        console.error('⚠️ Erreur génération Annexe21:', annexeError);
        
        sessionStorage.setItem('kinjo_verification_data', JSON.stringify({
          userType: formData.userType,
          registrationType: formData.registrationType,
          email: formData.email,
          tableName: 'producteurs',
          recordId: producteur.id,
          installationId: installation.id,
          annexe21Error: annexeError.message
        }));
      }

      console.log('🎉 Inscription producteur terminée avec succès');
      navigate('/confirm?verification=true');

    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    const currentStepComponent = stepConfig[currentStep - 1]?.component;
    const isLastStep = currentStep === totalSteps;
    
    const commonProps = {
      formData,
      updateFormData,
      handleNext,
      loading,
      companyLoading,
      setCompanyLoading,
      setError,
      supabase,
      handleFinalSubmit,
      isLastStep
    };

    switch (currentStepComponent) {
      case 'TypeSelectionStep':
        return <TypeSelectionStep {...commonProps} />;
      case 'EmailStep':
        return <EmailStep {...commonProps} />;
      case 'PersonalInfoStep':
        return <PersonalInfoStep {...commonProps} />;
      case 'PhoneStep':
        return <PhoneStep {...commonProps} />;
      case 'AddressStep':
        return <AddressStep {...commonProps} />;
      case 'PasswordStep':
        return <PasswordStep {...commonProps} />;
      case 'SiretStep':
        return <SiretStep {...commonProps} />;
      case 'ContactStep':
        return <ContactStep {...commonProps} />;
      case 'InstallationStep':
        return <InstallationStep {...commonProps} />;
      case 'FinalStep':
        return <FinalStep {...commonProps} />;
      default:
        return <div>Étape non trouvée</div>;
    }
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
          <h1 className="text-4xl font-parkisans font-bold text-white mb-2">Inscription Producteur</h1>
          <p className="text-white/80">
            {stepConfig[currentStep - 1]?.title} ({currentStep}/{totalSteps})
          </p>
        </div>
      </div>
      
      <div className="max-w-md mx-auto px-4 -mt-8 relative z-10">
        <Card className="p-6 bg-white rounded-2xl shadow-lg">
          <div className="mb-6">
            <Progress value={progress} className="w-full" />
          </div>

          {currentStep > 1 && (
            <BackButton onClick={prevStep} className="mb-4" />
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {renderCurrentStep()}
        </Card>
      </div>
    </div>
  );
};