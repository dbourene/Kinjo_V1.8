import React, { useState, useEffect, useCallback } from 'react';
import { Range, getTrackBackground } from 'react-range';

interface TimeRange {
  start: string;
  end: string;
  type: 'HC' | 'HP' | 'POINTE';
}

interface TimeRangeGraphProps {
  classeTemporelle?: string;
  onRangesChange: (ranges: TimeRange[]) => void;
  hc1Start: string;
  hc1End: string;
  hc2Start: string;
  hc2End: string;
  onTimeChange: (field: string, value: string) => void;
}

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Couleurs selon vos spécifications
const COLORS = {
  HC: '#92C55E',    // Heures creuses - vert
  HP: '#FFB902',    // Heures pleines - jaune/orange
  POINTE: '#1D4C3C' // Heures de pointe - vert foncé
};

export const TimeRangeGraph: React.FC<TimeRangeGraphProps> = ({
  ranges = [],
  classeTemporelle = 'DT',
  onRangesChange,
  hc1Start,
  hc1End,
  hc2Start,
  hc2End,
  onTimeChange
}) => {
  const [sliderValues, setSliderValues] = useState<number[]>([]);

  // Debug: Log des props reçues
  useEffect(() => {
    console.log('  - rangesData.length:', ranges?.length);
    console.log('  - classeTemporelle:', classeTemporelle);
    console.log('  - JSON.stringify(rangesData):', JSON.stringify(ranges));
  }, [ranges, classeTemporelle]);

  // Construire les plages à partir des champs de saisie
  const buildRangesFromInputs = useCallback((): TimeRange[] => {
    const newRanges: TimeRange[] = [];

    // Ajouter HC1 si définie
    if (hc1Start && hc1End) {
      newRanges.push({
        start: hc1Start,
        end: hc1End,
        type: 'HC'
      });
    }

    // Ajouter HC2 si définie
    if (hc2Start && hc2End) {
      newRanges.push({
        start: hc2Start,
        end: hc2End,
        type: 'HC'
      });
    }

    return newRanges;
  }, [hc1Start, hc1End, hc2Start, hc2End]);

  // Construire les valeurs du slider à partir des plages
  const buildSliderValues = useCallback((ranges: TimeRange[]): number[] => {
    const values: number[] = [];
    
    ranges.forEach(range => {
      const startMinutes = timeToMinutes(range.start);
      const endMinutes = timeToMinutes(range.end);
      
      // Gérer le cas où la plage traverse minuit (ex: 22:00-6:00)
      if (endMinutes < startMinutes) {
        // Plage qui traverse minuit
        values.push(startMinutes, 1440); // Jusqu'à minuit
        values.push(0, endMinutes);      // Depuis minuit
      } else {
        values.push(startMinutes, endMinutes);
      }
    });

    return values.sort((a, b) => a - b);
  }, []);

  // Mettre à jour les valeurs du slider quand les champs changent
  useEffect(() => {
    const currentRanges = buildRangesFromInputs();
    const newSliderValues = buildSliderValues(currentRanges);
    setSliderValues(newSliderValues);
  }, [hc1Start, hc1End, hc2Start, hc2End, buildRangesFromInputs, buildSliderValues]);

  // Construire les segments colorés pour l'affichage
  const buildColorSegments = useCallback((): Array<{start: number, end: number, type: 'HC' | 'HP'}> => {
    const segments: Array<{start: number, end: number, type: 'HC' | 'HP'}> = [];
    const ranges = buildRangesFromInputs();
    
    console.log('🔧 Génération des segments avec ranges:', ranges);
    
    if (!ranges || ranges.length === 0) {
      console.log('📊 Aucune plage définie, tout en HP');
      // Aucune plage HC définie → Tout en HP
      return [{ start: 0, end: 1440, type: 'HP' }];
    }

    // Convertir les plages en segments de minutes
    const hcSegments: Array<{start: number, end: number}> = [];
    
    ranges.forEach(range => {
      const startMinutes = timeToMinutes(range.start);
      const endMinutes = timeToMinutes(range.end);
      
      if (endMinutes < startMinutes) {
        // Plage qui traverse minuit
        hcSegments.push({ start: startMinutes, end: 1440 });
        hcSegments.push({ start: 0, end: endMinutes });
      } else {
        hcSegments.push({ start: startMinutes, end: endMinutes });
      }
    });

    // Trier les segments HC
    hcSegments.sort((a, b) => a.start - b.start);

    console.log('🔄 Plages converties:', hcSegments);
    
    if (hcSegments.length === 0) {
      console.log('📊 Aucune plage valide, tout en HP');
      segments.push({ start: 0, end: 1440, type: 'HP' });
      return segments;
    }

    console.log('📋 Plages triées:', hcSegments);

    // Construire les segments finaux (HC + HP)
    let currentTime = 0;
    
    hcSegments.forEach(hcSegment => {
      // Ajouter HP avant ce segment HC
      if (currentTime < hcSegment.start) {
        console.log(`➕ Ajout segment HP: ${currentTime}-${hcSegment.start}`);
        segments.push({ start: currentTime, end: hcSegment.start, type: 'HP' });
      }
      
      // Ajouter le segment HC
      console.log(`➕ Ajout segment HC: ${hcSegment.start}-${hcSegment.end}`);
      segments.push({ start: hcSegment.start, end: hcSegment.end, type: 'HC' });
      currentTime = hcSegment.end;
    });

    // Ajouter HP final si nécessaire
    if (currentTime < 1440) {
      console.log(`➕ Ajout segment HP final: ${currentTime}-1440`);
      segments.push({ start: currentTime, end: 1440, type: 'HP' });
    }

    console.log('✅ Segments générés:', segments);
    return segments;
  }, [buildRangesFromInputs]);

  // Gestionnaire de changement du slider
  const handleSliderChange = useCallback((values: number[]) => {
    try {
      setSliderValues(values);
      
      // Convertir les valeurs en plages et mettre à jour les champs
      if (values.length >= 2) {
        const newHc1Start = minutesToTime(values[0]);
        const newHc1End = minutesToTime(values[1]);
        
        onTimeChange('hc1Start', newHc1Start);
        onTimeChange('hc1End', newHc1End);
        
        // Si on a 4 valeurs, c'est HC2
        if (values.length >= 4) {
          const newHc2Start = minutesToTime(values[2]);
          const newHc2End = minutesToTime(values[3]);
          
          onTimeChange('hc2Start', newHc2Start);
          onTimeChange('hc2End', newHc2End);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du changement de slider:', error);
    }
  }, [onTimeChange]);

  const colorSegments = buildColorSegments();

  console.log('🎨 Rendu avec segments:', colorSegments.length);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-3">📊 Visualisation 24h</h4>
        
        {/* Graphique principal */}
        <div className="relative">
          {/* Barre de fond avec segments colorés */}
          <div className="h-12 rounded-lg overflow-hidden border border-gray-300 relative">
            {colorSegments.map((segment, index) => {
              const widthPercent = ((segment.end - segment.start) / 1440) * 100;
              const leftPercent = (segment.start / 1440) * 100;
              
              console.log(`🎨 Segment ${index}: ${segment.type}, ${widthPercent}%, left: ${leftPercent}%`);
              
              return (
                <div
                  key={index}
                  className="absolute h-full flex items-center justify-center text-white text-xs font-medium"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    backgroundColor: COLORS[segment.type],
                    minWidth: '2px' // Assurer une largeur minimale visible
                  }}
                >
                  {segment.type === 'HC' ? 'HC' : 'HP'}
                  <span className="ml-1 text-[10px]">
                    ({minutesToTime(segment.start)}-{minutesToTime(segment.end)})
                  </span>
                </div>
              );
            })}
          </div>

          {/* Slider interactif par-dessus */}
          {sliderValues.length > 0 && (
            <div className="absolute top-0 left-0 right-0 h-12">
              <Range
                step={15} // Pas de 15 minutes
                min={0}
                max={1440}
                values={sliderValues}
                onChange={handleSliderChange}
                renderTrack={({ props, children }) => (
                  <div
                    {...props}
                    className="h-12 w-full"
                    style={{
                      ...props.style,
                      background: 'transparent'
                    }}
                  >
                    {children}
                  </div>
                )}
                renderThumb={({ props, index }) => (
                  <div
                    {...props}
                    className="h-6 w-3 bg-white border-2 border-gray-600 rounded-sm shadow-lg cursor-grab active:cursor-grabbing"
                    style={{
                      ...props.style,
                      top: '12px'
                    }}
                  />
                )}
              />
            </div>
          )}

          {/* Échelle des heures */}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            {Array.from({ length: 25 }, (_, i) => (
              <span key={i} className={i % 6 === 0 ? 'font-medium' : ''}>
                {i === 24 ? '00' : i.toString().padStart(2, '0')}h
              </span>
            ))}
          </div>
        </div>

        {/* Légende */}
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.HC }}></div>
            <span className="text-sm text-gray-700">Heures Creuses</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.HP }}></div>
            <span className="text-sm text-gray-700">Heures Pleines</span>
          </div>
          {classeTemporelle === '5T' && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.POINTE }}></div>
              <span className="text-sm text-gray-700">Heures de Pointe</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Instructions :</strong> Saisissez les heures dans les champs ci-dessus. 
            Le graphique se met à jour automatiquement. Vous pouvez aussi glisser les curseurs blancs pour ajuster les plages.
          </p>
        </div>
      </div>
    </div>
  );
};