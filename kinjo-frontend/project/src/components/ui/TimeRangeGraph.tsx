// src/components/ui/TimeRangeGraph.tsx
// Composant React pour afficher un graphe des plages horaires (HC, HP, Pointe)
// Utilise Chart.js pour le rendu graphique

import React, { useEffect, useRef } from "react";
import { Chart, ChartConfiguration, registerables } from "chart.js";

Chart.register(...registerables);

// Types pour les plages horaires
interface TimeRange {
  start: string; // ex "10:00"
  end: string;   // ex "11:00"
  type: "hc" | "hp" | "pointe";
}

interface Props {
  timeRanges: TimeRange[];
}

const TimeRangeGraph: React.FC<Props> = ({ timeRanges = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  // Fonction utilitaire pour convertir HH:mm → minutes depuis minuit
  const toMinutes = (time: string): number => {
    if (!time) return 0; // Gère les chaînes vides
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  // Met à jour ou recrée le graphe quand les props changent
  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Génère un tableau 1440 (minutes) avec la couleur par défaut HP
    const data = new Array(1440).fill("#FFB902"); // HP = orange

    // Applique les couleurs selon les plages horaires
    (timeRanges || []).forEach(({ start, end, type }) => {
      const s = toMinutes(start);
      const e = toMinutes(end);
      const color =
        type === "hc" ? "#92C55E" : type === "pointe" ? "#1D4C3C" : "#FFB902";

      if (s < e) {
        for (let i = s; i < e; i++) {
          data[i % 1440] = color;
        }
      } else {
        // Plage qui passe minuit
        for (let i = s; i < 1440; i++) {
          data[i] = color;
        }
        for (let i = 0; i < e; i++) {
          data[i] = color;
        }
      }
    });

    const chartData = {
      labels: Array.from({ length: 1440 }, (_, i) => {
        const h = Math.floor(i / 60).toString().padStart(2, "0");
        const m = (i % 60).toString().padStart(2, "0");
        return `${h}:${m}`;
      }),
      datasets: [
        {
          label: "Plages horaires",
          data: new Array(1440).fill(1), // ligne plate
          backgroundColor: data,
          barThickness: 1,
        },
      ],
    };

    const config: ChartConfiguration = {
      type: "bar",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: false },
        },
      },
    };

    if (chartRef.current) {
      chartRef.current.destroy();
    }
    chartRef.current = new Chart(ctx, config);
  }, [timeRanges]); // <= important ! redessine si les props changent

  return (
    <div style={{ height: "80px" }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default TimeRangeGraph;
