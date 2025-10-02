// src/pages/ConsumerRegistration.tsx
// Page d'inscription pour les consommateurs (particuliers et entreprises)

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
import { InfoPopup } from '../components/ui/InfoPopup';
import TimeRangeGraph from '../components/ui/TimeRangeGraph';

interface ConsumerFormData {
  userType: 'consommateur';
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
  powerSubscription: string;
  subscriptionType: string;
  tariffBase: string;
  tariffHP: string;
  tariffHC: string;
  tariffHPH: string;
  tariffHCH: string;
  tariffHPB: string;
  tariffHCB: string;
  tariffPointe: string;
  offpeakHours: string;
  consumptionEstimate: string;
  address: string;
  coordinates: { latitude: number; longitude: number } | null;
  cguAccepted: boolean;
  dataAuthorization: boolean;
  hcStart1: string;
  hcEnd1: string;
  hcStart2: string;
  hcEnd2: string;
  pointeStart1: string;
  pointeEnd1: string;
  pointeStart2: string;
  pointeEnd2: string;
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

// ✅ COMPOSANTS D'ÉTAPES POUR CONSOMMATEURS
const TypeSelectionStep = ({ formData, updateFormData, handleNext }: any) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-center">
      Vous êtes un consommateur
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

const PrmStep = ({ formData, updateFormData, handleNext }: any) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-center">Votre numéro PRM</h2>
    <Input
      value={formData.prm}
      onChange={(e) => updateFormData('prm', e.target.value.replace(/\D/g, ''))}
      placeholder="14 chiffres"
      maxLength={14}
      className="w-full"
    />
    <Button
      onClick={handleNext}
      disabled={formData.prm.length !== 14}
      className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
    >
      Continuer
    </Button>
  </div>
);

const TariffStep = ({ formData, updateFormData, handleNext }: any) => {
  const [timeRanges, setTimeRanges] = useState({
    hc: [
      { start: formData.hcStart1 || '', end: formData.hcEnd1 || '' },
      { start: formData.hcStart2 || '', end: formData.hcEnd2 || '' }
    ],
    pointe: [
      { start: formData.pointeStart1 || '', end: formData.pointeEnd1 || '' },
      { start: formData.pointeStart2 || '', end: formData.pointeEnd2 || '' }
    ]
  });

  // Fonction pour convertir les timeRanges en format pour le graphique
  const convertTimeRangesToGraphFormat = useCallback(() => {
    const ranges = [];
    
    // Ajouter HC1 si les deux champs sont remplis
    if (timeRanges.hc[0].start && timeRanges.hc[0].end) {
      ranges.push({
        start: timeRanges.hc[0].start,
        end: timeRanges.hc[0].end,
        type: 'HC' as const,
        label: 'HC 1'
      });
    }
    
    // Ajouter HC2 si les deux champs sont remplis
    if (timeRanges.hc[1].start && timeRanges.hc[1].end) {
      ranges.push({
        start: timeRanges.hc[1].start,
        end: timeRanges.hc[1].end,
        type: 'HC' as const,
        label: 'HC 2'
      });
    }
    
    console.log('🔄 Conversion timeRanges vers graphique:', ranges);
    return ranges;
  }, [timeRanges]);

  // State pour les ranges du graphique
  const [graphRanges, setGraphRanges] = useState([]);

  // Synchroniser timeRanges vers graphRanges
  useEffect(() => {
    const newRanges = convertTimeRangesToGraphFormat();
    console.log('📊 Mise à jour graphique avec ranges:', newRanges);
    setGraphRanges(newRanges);
  }, [convertTimeRangesToGraphFormat]);

  const [validationError, setValidationError] = useState('');

  // Synchroniser timeRanges avec formData au chargement
  useEffect(() => {
    setTimeRanges({
      hc: [
        { start: formData.hcStart1 || '', end: formData.hcEnd1 || '' },
        { start: formData.hcStart2 || '', end: formData.hcEnd2 || '' }
      ],
      pointe: [
        { start: formData.pointeStart1 || '', end: formData.pointeEnd1 || '' },
        { start: formData.pointeStart2 || '', end: formData.pointeEnd2 || '' }
      ]
    });
  }, [formData.hcStart1, formData.hcEnd1, formData.hcStart2, formData.hcEnd2, formData.pointeStart1, formData.pointeEnd1, formData.pointeStart2, formData.pointeEnd2]);

  // Fonction sécurisée pour parser les plages horaires
  const parseOffpeakHours = (offpeakHoursString: string): Array<{start: number, end: number}> => {
    if (!offpeakHoursString || offpeakHoursString.trim() === '') {
      return [];
    }
    
    try {
      const parsed = JSON.parse(offpeakHoursString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Erreur parsing offpeakHours:', error);
      return [];
    }
  };

  // Fonction sécurisée pour convertir les plages en JSON
  const rangesToJson = (ranges: Array<{start: number, end: number}>): string => {
    if (!Array.isArray(ranges) || ranges.length === 0) {
      return '';
    }
    return JSON.stringify(ranges);
  };

  // Déterminer les options d'abonnement selon la puissance
  const getSubscriptionOptions = () => {
    const power = parseFloat(formData.powerSubscription);
    if (isNaN(power)) return [];
    
    if (power <= 36) {
      return [
        { value: 'unique', label: 'Tarif unique' },
        { value: 'hp_hc', label: 'Tarif HP/HC' }
      ];
    } else if (power <= 250) {
      return [
        { value: 'unique', label: 'Tarif unique' },
        { value: '4_classes', label: 'Tarif 4 classes temporelles' }
      ];
    } else {
      return [
        { value: '4_classes', label: 'Tarif 4 classes temporelles' },
        { value: '5_classes', label: 'Tarif 5 classes temporelles' }
      ];
    }
  };

  // Vérifier les superpositions de plages
  const checkTimeRangeOverlaps = () => {
    const allRanges = [];
    
    // Ajouter les plages HC
    timeRanges.hc.forEach((range, index) => {
      if (range.start && range.end) {
        allRanges.push({ type: 'HC', index, start: range.start, end: range.end });
      }
    });
    
    // Ajouter les plages pointe si applicable
    if (formData.subscriptionType === '5_classes') {
      timeRanges.pointe.forEach((range, index) => {
        if (range.start && range.end) {
          allRanges.push({ type: 'Pointe', index, start: range.start, end: range.end });
        }
      });
    }
    
    // Vérifier les superpositions
    for (let i = 0; i < allRanges.length; i++) {
      for (let j = i + 1; j < allRanges.length; j++) {
        const range1 = allRanges[i];
        const range2 = allRanges[j];
        
        if (isTimeOverlap(range1.start, range1.end, range2.start, range2.end)) {
          return `Superposition détectée entre ${range1.type} ${range1.index + 1} et ${range2.type} ${range2.index + 1}`;
        }
      }
    }
    
    return null;
  };

  // Vérifier si deux plages se superposent
  const isTimeOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    const time1Start = timeToMinutes(start1);
    const time1End = timeToMinutes(end1);
    const time2Start = timeToMinutes(start2);
    const time2End = timeToMinutes(end2);
    
    return !(time1End <= time2Start || time2End <= time1Start);
  };

  // Convertir HH:MM en minutes
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Mettre à jour les plages horaires
  const updateTimeRange = (type: 'hc' | 'pointe', index: number, field: 'start' | 'end', value: string) => {
    console.log(`⏰ Mise à jour plage ${index}, champ ${field}, valeur: ${value}`);
    
    setTimeRanges(prev => {
      const newRanges = { ...prev };
      newRanges[type][index][field] = value;
      return newRanges;
    });

    // Mettre à jour formData
    if (type === 'hc') {
      if (index === 0) {
        updateFormData(field === 'start' ? 'hcStart1' : 'hcEnd1', value);
      } else {
        updateFormData(field === 'start' ? 'hcStart2' : 'hcEnd2', value);
      }
    } else {
      if (index === 0) {
        updateFormData(field === 'start' ? 'pointeStart1' : 'pointeEnd1', value);
      } else {
        updateFormData(field === 'start' ? 'pointeStart2' : 'pointeEnd2', value);
      }
    }

    // Mettre à jour offpeakHours
    updateOffpeakHours();
  };

  // Mettre à jour le champ offpeakHours
  const updateOffpeakHours = () => {
    const ranges = [];
    
    // Ajouter les plages HC
    timeRanges.hc.forEach(range => {
      if (range.start && range.end) {
        ranges.push(`HC (${range.start}-${range.end})`);
      }
    });
    
    // Ajouter les plages pointe si applicable
    if (formData.subscriptionType === '5_classes') {
      timeRanges.pointe.forEach(range => {
        if (range.start && range.end) {
          ranges.push(`Pointe (${range.start}-${range.end})`);
        }
      });
    }
    
    updateFormData('offpeakHours', ranges.join('; '));
  };

  // Validation du formulaire
  const validateForm = () => {
    if (!formData.powerSubscription) {
      setValidationError('Veuillez saisir la puissance souscrite');
      return false;
    }
    
    if (!formData.subscriptionType) {
      setValidationError('Veuillez sélectionner un type d\'abonnement');
      return false;
    }
    
    // Validation selon le type d'abonnement
    switch (formData.subscriptionType) {
      case 'unique':
        if (!formData.tariffBase) {
          setValidationError('Veuillez saisir le tarif de base');
          return false;
        }
        break;
      case 'hp_hc':
        if (!formData.tariffHP || !formData.tariffHC) {
          setValidationError('Veuillez saisir les tarifs HP et HC');
          return false;
        }
        // Vérifier qu'au moins une plage HC est définie
        if (!timeRanges.hc[0].start || !timeRanges.hc[0].end) {
          setValidationError('Veuillez définir au moins une plage d\'heures creuses');
          return false;
        }
        break;
      case '4_classes':
        if (!formData.tariffHPH || !formData.tariffHCH || !formData.tariffHPB || !formData.tariffHCB) {
          setValidationError('Veuillez saisir tous les tarifs (HPH, HCH, HPB, HCB)');
          return false;
        }
        if (!timeRanges.hc[0].start || !timeRanges.hc[0].end) {
          setValidationError('Veuillez définir au moins une plage d\'heures creuses');
          return false;
        }
        break;
      case '5_classes':
        if (!formData.tariffHPH || !formData.tariffHCH || !formData.tariffHPB || !formData.tariffHCB || !formData.tariffPointe) {
          setValidationError('Veuillez saisir tous les tarifs y compris la pointe');
          return false;
        }
        if (!timeRanges.hc[0].start || !timeRanges.hc[0].end) {
          setValidationError('Veuillez définir au moins une plage d\'heures creuses');
          return false;
        }
        if (!timeRanges.pointe[0].start || !timeRanges.pointe[0].end) {
          setValidationError('Veuillez définir au moins une plage de pointe');
          return false;
        }
        break;
    }
    
    // Vérifier les superpositions
    const overlapError = checkTimeRangeOverlaps();
    if (overlapError) {
      setValidationError(overlapError);
      return false;
    }
    
    setValidationError('');
    return true;
  };

  const handleContinue = () => {
    if (validateForm()) {
      handleNext();
    }
  };

  const subscriptionOptions = getSubscriptionOptions();

  // Convertir les timeRanges pour le graphique
  const convertTimeRangesToGraphFormat2 = () => {
    console.log('🔄 DÉBUT convertTimeRangesToGraphFormat');
    console.log('📊 formData.timeRanges actuel:', formData.timeRanges);
    console.log('📊 Type de formData.timeRanges:', typeof formData.timeRanges);
    console.log('📊 Array.isArray(formData.timeRanges):', Array.isArray(formData.timeRanges));
    
    const ranges = [];
    
    // Ajouter les plages HC
      console.log('✅ timeRanges est un array valide, longueur:', formData.timeRanges.length);
      
    timeRanges.hc.forEach((range, index) => {
      if (range.start && range.end) {
        ranges.push({
          start: range.start,
          end: range.end,
          type: 'HC' as const,
          label: `HC ${index + 1}`
        });
      }
    });
    
    // Ajouter les plages pointe si applicable
    if (formData.subscriptionType === '5_classes') {
      timeRanges.pointe.forEach((range, index) => {
        console.log(`🔍 Traitement range ${index}:`, range);
        console.log(`  - start: "${range.start}" (type: ${typeof range.start})`);
        console.log(`  - end: "${range.end}" (type: ${typeof range.end})`);
        
        if (range.start && range.end) {
          console.log(`✅ Range ${index} valide, ajout au graphique`);
          ranges.push({
            start: range.start,
            end: range.end,
            type: 'pointe' as const,
            label: `Pointe ${index + 1}`
          });
        } else {
          console.log(`❌ Range ${index} invalide ou incomplète`);
        }
      });
    } else {
      console.log('❌ timeRanges n\'est pas un array valide');
    }
    
    console.log('🔄 FIN convertTimeRangesToGraphFormat, ranges générées:', ranges);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Vos tarifs actuels</h2>
      
      {/* Puissance souscrite */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Puissance souscrite
        </label>
        <div className="relative">
          <Input
            type="number"
            step="0.1"
            value={formData.powerSubscription}
            onChange={(e) => {
              updateFormData('powerSubscription', e.target.value);
              updateFormData('subscriptionType', '');
            }}
            placeholder="Ex: 9"
            className="w-full pr-12"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            kVA
          </span>
        </div>
      </div>

      {/* Type d'abonnement */}
      {formData.powerSubscription && subscriptionOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type d'abonnement
          </label>
          <select
            value={formData.subscriptionType}
            onChange={(e) => updateFormData('subscriptionType', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#92C55E] focus:border-transparent"
          >
            <option value="">Sélectionnez un type</option>
            {subscriptionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Formulaire tarif unique */}
      {formData.subscriptionType === 'unique' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tarif
          </label>
          <div className="relative">
            <Input
              type="number"
              step="0.01"
              value={formData.tariffBase}
              onChange={(e) => updateFormData('tariffBase', e.target.value)}
              placeholder="Ex: 15.5"
              className="w-full pr-20"
            />
            
            {/* Debug info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">🔍 Debug Info:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>timeRanges:</strong> {JSON.stringify(formData.timeRanges)}</p>
                <p><strong>graphRanges:</strong> {JSON.stringify(graphRanges)}</p>
                <p><strong>graphRanges.length:</strong> {graphRanges.length}</p>
              </div>
            </div>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              ct€HT/kWh
            </span>
          </div>
        </div>
      )}

      {/* Formulaire HP/HC */}
      {formData.subscriptionType === 'hp_hc' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarif Heure Pleine
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.01}
                  value={formData.tariffHP}
                  onChange={(e) => updateFormData('tariffHP', e.target.value)}
                  placeholder="Ex: 18.5"
                  className="w-full pr-20"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                  ct€HT/kWh
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarif Heure Creuse
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.01}
                  value={formData.tariffHC}
                  onChange={(e) => updateFormData('tariffHC', e.target.value)}
                  placeholder="Ex: 13.5"
                  className="w-full pr-20"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                  ct€HT/kWh
                </span>
              </div>
            </div>
          </div>

          {/* Plages horaires HC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Plages horaires Heures Creuses
            </label>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Début HC 1</label>
                <Input
                  type="time"
                  value={timeRanges.hc[0].start}
                  onChange={(e) => updateTimeRange('hc', 0, 'start', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Fin HC 1</label>
                <Input
                  type="time"
                  value={timeRanges.hc[0].end}
                  onChange={(e) => updateTimeRange('hc', 0, 'end', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Début HC 2 (optionnel)</label>
                <Input
                  type="time"
                  value={timeRanges.hc[1].start}
                  onChange={(e) => updateTimeRange('hc', 1, 'start', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Fin HC 2 (optionnel)</label>
                <Input
                  type="time"
                  value={timeRanges.hc[1].end}
                  onChange={(e) => updateTimeRange('hc', 1, 'end', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire 4 classes */}
      {formData.subscriptionType === '4_classes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarif HP Hiver
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.01}
                  value={formData.tariffHPH}
                  onChange={(e) => updateFormData('tariffHPH', e.target.value)}
                  placeholder="Ex: 19.5"
                  className="w-full pr-20"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                  ct€HT/kWh
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarif HC Hiver
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.01}
                  value={formData.tariffHCH}
                  onChange={(e) => updateFormData('tariffHCH', e.target.value)}
                  placeholder="Ex: 14.5"
                  className="w-full pr-20"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                  ct€HT/kWh
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarif HP Été
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.01}
                  value={formData.tariffHPB}
                  onChange={(e) => updateFormData('tariffHPB', e.target.value)}
                  placeholder="Ex: 17.5"
                  className="w-full pr-20"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                  ct€HT/kWh
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarif HC Été
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.01}
                  value={formData.tariffHCB}
                  onChange={(e) => updateFormData('tariffHCB', e.target.value)}
                  placeholder="Ex: 12.5"
                  className="w-full pr-20"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                  ct€HT/kWh
                </span>
              </div>
            </div>
          </div>

          {/* Plages horaires HC pour 4 classes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Plages horaires Heures Creuses
            </label>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Début HC 1</label>
                <Input
                  type="time"
                  value={timeRanges.hc[0].start}
                  onChange={(e) => updateTimeRange('hc', 0, 'start', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Fin HC 1</label>
                <Input
                  type="time"
                  value={timeRanges.hc[0].end}
                  onChange={(e) => updateTimeRange('hc', 0, 'end', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Début HC 2 (optionnel)</label>
                <Input
                  type="time"
                  value={timeRanges.hc[1].start}
                  onChange={(e) => updateTimeRange('hc', 1, 'start', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Fin HC 2 (optionnel)</label>
                <Input
                  type="time"
                  value={timeRanges.hc[1].end}
                  onChange={(e) => updateTimeRange('hc', 1, 'end', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire 5 classes */}
      {formData.subscriptionType === '5_classes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarif HP Hiver
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.01}
                  value={formData.tariffHPH}
                  onChange={(e) => updateFormData('tariffHPH', e.target.value)}
                  placeholder="Ex: 19.5"
                  className="w-full pr-20"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                  ct€HT/kWh
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarif HC Hiver
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.01}
                  value={formData.tariffHCH}
                  onChange={(e) => updateFormData('tariffHCH', e.target.value)}
                  placeholder="Ex: 14.5"
                  className="w-full pr-20"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                  ct€HT/kWh
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarif HP Été
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.01}
                  value={formData.tariffHPB}
                  onChange={(e) => updateFormData('tariffHPB', e.target.value)}
                  placeholder="Ex: 17.5"
                  className="w-full pr-20"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                  ct€HT/kWh
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarif HC Été
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.01}
                  value={formData.tariffHCB}
                  onChange={(e) => updateFormData('tariffHCB', e.target.value)}
                  placeholder="Ex: 12.5"
                  className="w-full pr-20"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                  ct€HT/kWh
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarif Pointe
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step={0.01}
                  value={formData.tariffPointe}
                  onChange={(e) => updateFormData('tariffPointe', e.target.value)}
                  placeholder="Ex: 25.0"
                  className="w-full pr-20"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                  ct€HT/kWh
                </span>
              </div>
            </div>
          </div>

          {/* Plages horaires HC pour 5 classes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Plages horaires Heures Creuses
            </label>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Début HC 1</label>
                <Input
                  type="time"
                  value={timeRanges.hc[0].start}
                  onChange={(e) => updateTimeRange('hc', 0, 'start', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Fin HC 1</label>
                <Input
                  type="time"
                  value={timeRanges.hc[0].end}
                  onChange={(e) => updateTimeRange('hc', 0, 'end', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Début HC 2 (optionnel)</label>
                <Input
                  type="time"
                  value={timeRanges.hc[1].start}
                  onChange={(e) => updateTimeRange('hc', 1, 'start', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Fin HC 2 (optionnel)</label>
                <Input
                  type="time"
                  value={timeRanges.hc[1].end}
                  onChange={(e) => updateTimeRange('hc', 1, 'end', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Plages horaires Pointe pour 5 classes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Plages horaires Heures de Pointe
            </label>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Début Pointe 1</label>
                <Input
                  type="time"
                  value={timeRanges.pointe[0].start}
                  onChange={(e) => updateTimeRange('pointe', 0, 'start', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Fin Pointe 1</label>
                <Input
                  type="time"
                  value={timeRanges.pointe[0].end}
                  onChange={(e) => updateTimeRange('pointe', 0, 'end', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Début Pointe 2 (optionnel)</label>
                <Input
                  type="time"
                  value={timeRanges.pointe[1].start}
                  onChange={(e) => updateTimeRange('pointe', 1, 'start', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Fin Pointe 2 (optionnel)</label>
                <Input
                  type="time"
                  value={timeRanges.pointe[1].end}
                  onChange={(e) => updateTimeRange('pointe', 1, 'end', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graphique de visualisation - APRÈS tous les champs de tarifs */}
      {(formData.subscriptionType === 'hp_hc' || formData.subscriptionType === '4_classes' || formData.subscriptionType === '5_classes') && (
        <div className="mt-6">
          <TimeRangeGraph
            rangesData={graphRanges || []}
            classeTemporelle={formData.classeTemporelleTarifaire || 'DT'}
          />
          
          {/* Debug panel pour voir les données transmises */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">🔍 Debug - Données transmises au graphique :</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• formData.timeRanges: {JSON.stringify(formData.timeRanges)}</p>
              <p>• graphRanges: {JSON.stringify(graphRanges)}</p>
              <p>• graphRanges.length: {graphRanges?.length || 0}</p>
              <p>• classeTemporelle: {formData.classeTemporelleTarifaire || 'DT'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Consommation estimée */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Consommation annuelle estimée
        </label>
        <div className="relative">
          <Input
            type="number"
            step="100"
            value={formData.consumptionEstimate}
            onChange={(e) => updateFormData('consumptionEstimate', e.target.value)}
            placeholder="Ex: 5000"
            className="w-full pr-16"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            kWh/an
          </span>
        </div>
      </div>

      {/* Erreur de validation */}
      {validationError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{validationError}</p>
        </div>
      )}

      <Button
        onClick={handleContinue}
        disabled={!formData.consumptionEstimate}
        className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
      >
        Continuer
      </Button>
    </div>
  );
};

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
      <h2 className="text-xl font-semibold text-center">Votre adresse</h2>
      
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

const SiretStep = ({ formData, updateFormData, handleNext, companyLoading, setCompanyLoading, setError }: any) => {
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

const CGUStep = ({ formData, updateFormData, handleNext, loading }: any) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-center">Conditions Générales d'Utilisation</h2>
    
    <div className="space-y-4">
      <label className="flex items-start space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.cguAccepted || false}
          onChange={(e) => updateFormData('cguAccepted', e.target.checked)}
          className="mt-1 w-4 h-4 text-[#92C55E] border-gray-300 rounded focus:ring-[#92C55E]"
        />
        <span className="text-sm text-gray-700 leading-relaxed">
          J'ai pris connaissance des{' '}
          <a 
            href="https://jkpugvpeejprxyczkcqt.supabase.co/storage/v1/object/public/cgus/Conditions_generales_d_utilisation_V0_1.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Conditions générales d'utilisation
          </a>
        </span>
      </label>
    </div>
    <Button
      onClick={handleNext}
      disabled={!formData.cguAccepted || loading}
      className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
    >
      {loading ? 'Création en cours...' : 'Valider mon inscription'}
    </Button>
  </div>
);

const DataAuthorizationStep = ({ formData, updateFormData, handleNext }: any) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-center">Autorisation d'accès aux données</h2>
    
    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 space-y-3">
      <p className="font-medium">
        En association avec Enedis, Kinjo a besoin d'accéder de manière récurrente à l'ensemble des données ci-dessous.
        Cela vous permet de bénéficier pleinement des services de Kinjo notamment de simulation.
      </p>
      
      <div>
        <p className="font-medium mb-2">Quelles données sont utilisées ?</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Les mesures en kWh, les puissances atteintes et dépassements de puissance</li>
          <li>Les index quotidiens</li>
          <li>La courbe de charge, aux pas de temps restitués par Enedis</li>
          <li>Les données techniques et contractuelles : Caractéristiques du raccordement, du dispositif de comptage et des informations contractuelles (option tarifaire, puissance souscrite…)</li>
        </ul>
      </div>
    </div>

    <div className="space-y-4">
      <label className="flex items-start space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.dataAuthorization || false}
          onChange={(e) => updateFormData('dataAuthorization', e.target.checked)}
          className="mt-1 w-4 h-4 text-[#92C55E] border-gray-300 rounded focus:ring-[#92C55E]"
        />
        <span className="text-sm text-gray-700 leading-relaxed">
          Je déclare sur l'honneur être titulaire du point de consommation ou être mandaté par celui-ci, j'accepte que Kinjo <InfoPopup contentKey="kinjo" /> ainsi que PMO Helioze <InfoPopup contentKey="helioze" />, son partenaire dans l'analyse des données issues d'Enedis <InfoPopup contentKey="enedis" />, demandent et reçoivent la communication auprès d'Enedis les données ci-dessus sur les 2 ans passés et cela pour les 2 ans à venir, sous réserve de disponibilité. Je confirme  avoir pris connaissance des <InfoPopup contentKey="mentionsAutComDon" trigger="text" label="mentions légales" />.
        </span>
      </label>

      <div className="bg-yellow-50 p-3 rounded-lg">
        <p className="text-xs text-yellow-800">
          🔎 Vos données ainsi acquises sont détruites dès la fin de validité de la présente autorisation.
        </p>
      </div>   
    </div>

    <Button
      onClick={handleNext}
      disabled={!formData.dataAuthorization}
      className="w-full bg-[#92C55E] text-white rounded-xl h-12 hover:bg-[#83b150]"
    >
      Continuer
    </Button>
  </div>
);

export const ConsumerRegistration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companyLoading, setCompanyLoading] = useState(false);

  const [formData, setFormData] = useState<ConsumerFormData>({
    userType: 'consommateur',
    registrationType: 'particulier',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    siret: '',
    companyData: null,
    timeRanges: [
      { start: '', end: '' },
      { start: '', end: '' }
    ],
    classeTemporelleTarifaire: 'DT',
    offpeakHours: '',
    prm: '',
    powerSubscription: '',
    subscriptionType: '',
    tariffBase: '',
    tariffHP: '',
    tariffHC: '',
    tariffHPH: '',
    tariffHCH: '',
    tariffHPB: '',
    tariffHCB: '',
    tariffPointe: '',
    offpeakHours: '',
    consumptionEstimate: '',
    address: '',
    coordinates: null,
    cguAccepted: false,
    dataAuthorization: false,
    hcStart1: '',
    hcEnd1: '',
    hcStart2: '',
    hcEnd2: '',
    pointeStart1: '',
    pointeEnd1: '',
    pointeStart2: '',
    pointeEnd2: ''
  });

  const updateFormData = useCallback((field: keyof ConsumerFormData, value: any) => {
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

  // Configuration des étapes pour consommateurs
  const getStepConfig = () => {
    if (formData.registrationType === 'particulier') {
      return [
        { title: 'Type d\'inscription', component: 'TypeSelectionStep' },
        { title: 'Votre PRM', component: 'PrmStep' },
        { title: 'Vos tarifs', component: 'TariffStep' },
        { title: 'Votre adresse', component: 'AddressStep' },
        { title: 'Votre email', component: 'EmailStep' },
        { title: 'Vos informations', component: 'PersonalInfoStep' },
        { title: 'Votre téléphone', component: 'PhoneStep' },
        { title: 'Autorisation données', component: 'DataAuthorizationStep' },
        { title: 'CGU', component: 'CGUStep' },
        { title: 'Votre mot de passe', component: 'PasswordStep' }
      ];
    } else {
      return [
        { title: 'Type d\'inscription', component: 'TypeSelectionStep' },
        { title: 'Votre PRM', component: 'PrmStep' },
        { title: 'Vos tarifs', component: 'TariffStep' },
        { title: 'Votre email', component: 'EmailStep' },
        { title: 'Numéro de SIRET', component: 'SiretStep' },
        { title: 'Contact', component: 'ContactStep' },
        { title: 'Autorisation données', component: 'DataAuthorizationStep' },
        { title: 'CGU', component: 'CGUStep' },
        { title: 'Votre mot de passe', component: 'PasswordStep' }
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
      case 'PrmStep':
        return formData.prm.length === 14;
      case 'TariffStep':
        return formData.powerSubscription !== '' && formData.subscriptionType !== '';
      case 'AddressStep':
        return formData.address !== '' && formData.coordinates !== null;
      case 'EmailStep':
        return formData.email !== '' && formData.email.includes('@');
      case 'PersonalInfoStep':
        return formData.firstName !== '' && formData.lastName !== '';
      case 'PhoneStep':
        return formData.phone !== '';
      case 'PasswordStep':
        return formData.password !== '' && formData.password === formData.confirmPassword;
      case 'SiretStep':
        return formData.siret !== '' && formData.companyData !== null;
      case 'ContactStep':
        return formData.firstName !== '' && formData.lastName !== '';
      case 'DataAuthorizationStep':
        return formData.dataAuthorization === true;
      case 'CGUStep':
        return formData.cguAccepted === true;
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

  // Fonction pour construire l'adresse complète
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
      console.log('🚀 Début de l\'inscription consommateur finale');

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

      // 2. Préparer les données consommateur
      console.log('🏠 Traitement inscription consommateur...');

      // Utiliser les coordonnées déjà obtenues via l'API adresse
      const coordinates = formData.coordinates;
      const fullAddress = buildFullAddress();

      console.log('📍 Coordonnées finales:', coordinates);
      console.log('🏠 Adresse finale:', fullAddress);

      // Déterminer la classe temporelle tarifaire
      let classeTemporelleTarifaire = 'TU'; // Par défaut
      switch (formData.subscriptionType) {
        case 'unique':
          classeTemporelleTarifaire = 'TU';
          break;
        case 'hp_hc':
          classeTemporelleTarifaire = 'DT';
          break;
        case '4_classes':
          classeTemporelleTarifaire = '4T';
          break;
        case '5_classes':
          classeTemporelleTarifaire = '5T';
          break;
      }

      // 2a. Insérer dans la table consommateurs
      const type = formData.registrationType === 'entreprise' ? 'pro' : 'particulier';
      const consommateurData = {
        id: crypto.randomUUID(),
        user_id: authData.user.id,
        contact_email: formData.email,
        contact_prenom: formData.firstName,
        contact_nom: formData.lastName,
        contact_telephone: formData.phone || null,
        prm: formData.prm,
        conso_estimee_annee: parseFloat(formData.consumptionEstimate),
        puissance_branchement: parseFloat(formData.powerSubscription),
        classe_temporelle_tarifaire: classeTemporelleTarifaire,
        tarif_base: formData.tariffBase ? parseFloat(formData.tariffBase) : null,
        tarif_hp: formData.tariffHP ? parseFloat(formData.tariffHP) : null,
        tarif_hc: formData.tariffHC ? parseFloat(formData.tariffHC) : null,
        tarif_hph: formData.tariffHPH ? parseFloat(formData.tariffHPH) : null,
        tarif_hch: formData.tariffHCH ? parseFloat(formData.tariffHCH) : null,
        tarif_hpb: formData.tariffHPB ? parseFloat(formData.tariffHPB) : null,
        tarif_hcb: formData.tariffHCB ? parseFloat(formData.tariffHCB) : null,
        tarif_pointe: formData.tariffPointe ? parseFloat(formData.tariffPointe) : null,
        offpeak_hours: formData.offpeakHours || null,
        statut: '1',
        type,
        adresse: fullAddress,
        latitude: coordinates?.latitude || null,
        longitude: coordinates?.longitude || null,
        ...(formData.registrationType === 'entreprise' && formData.companyData && {
          siret: formData.siret,
          siren: formData.companyData.uniteLegale?.siren,
          dateCreationEtablissement: formData.companyData.dateCreationEtablissement,
          trancheEffectifsEtablissement: formData.companyData.trancheEffectifsEtablissement
        })
      };

      console.log('💾 Insertion consommateur:', consommateurData);

      const { error: consommateurError } = await supabase
        .from('consommateurs')
        .insert([consommateurData]);

      if (consommateurError) {
        console.error('❌ Erreur insertion consommateur:', consommateurError);
        throw consommateurError;
      }

      console.log('✅ Consommateur inséré avec succès');

      // 3. Redirection vers la page de confirmation
      navigate('/confirm?verification=true');

    } catch (error: any) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    const currentStepComponent = stepConfig[currentStep - 1].component;
    const isLastStep = currentStep === totalSteps;

    const commonProps = {
      formData,
      updateFormData,
      handleNext,
      handleFinalSubmit,
      isLastStep,
      loading,
      companyLoading,
      setCompanyLoading,
      setError
    };

    switch (currentStepComponent) {
      case 'TypeSelectionStep':
        return <TypeSelectionStep {...commonProps} />;
      case 'PrmStep':
        return <PrmStep {...commonProps} />;
      case 'TariffStep':
        return <TariffStep {...commonProps} />;
      case 'AddressStep':
        return <AddressStep {...commonProps} />;
      case 'EmailStep':
        return <EmailStep {...commonProps} />;
      case 'PersonalInfoStep':
        return <PersonalInfoStep {...commonProps} />;
      case 'PhoneStep':
        return <PhoneStep {...commonProps} />;
      case 'PasswordStep':
        return <PasswordStep {...commonProps} />;
      case 'SiretStep':
        return <SiretStep {...commonProps} />;
      case 'ContactStep':
        return <ContactStep {...commonProps} />;
      case 'DataAuthorizationStep':
        return <DataAuthorizationStep {...commonProps} />;
      case 'CGUStep':
        return <CGUStep {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">
        <Card className="p-6">
          <div className="mb-6">
            <BackButton onClick={() => navigate('/register')} />
            <Progress value={progress} className="mt-4" />
            <p className="text-sm text-gray-600 mt-2 text-center">
              Étape {currentStep} sur {totalSteps}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {renderCurrentStep()}

          {currentStep > 1 && (
            <Button
              onClick={prevStep}
              variant="outline"
              className="w-full mt-4"
            >
              Retour
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};