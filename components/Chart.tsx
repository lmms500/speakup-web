import React from 'react';
import { AnalysisResult } from '../types';

interface ChartProps {
  data: AnalysisResult[];
}

export const Chart: React.FC<ChartProps> = ({ data }) => {
  // Pegar os últimos 10 resultados e inverter para ordem cronológica (esquerda para direita)
  const chartData = [...data].slice(0, 10).reverse();

  if (chartData.length < 2) return null;

  const width = 300;
  const height = 120;
  const padding = 10;
  
  // Normalização
  const maxScore = 100;
  const minScore = 0;
  
  const getX = (index: number) => {
    return padding + (index / (chartData.length - 1)) * (width - 2 * padding);
  };

  const getY = (score: number) => {
    return height - padding - ((score - minScore) / (maxScore - minScore)) * (height - 2 * padding);
  };

  // Construir o caminho da linha (Path)
  let pathD = `M ${getX(0)} ${getY(chartData[0].score)}`;
  chartData.slice(1).forEach((point, i) => {
    pathD += ` L ${getX(i + 1)} ${getY(point.score)}`;
  });

  return (
    <div className="w-full bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-soft dark:shadow-dark-soft mb-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-brand-charcoal dark:text-dark-text">Sua Evolução</h3>
        <span className="text-xs font-bold text-brand-mint bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
          Últimos {chartData.length} treinos
        </span>
      </div>
      
      <div className="relative w-full h-32 flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid Lines */}
          <line x1={0} y1={getY(0)} x2={width} y2={getY(0)} stroke="#e2e8f0" strokeDasharray="4" strokeWidth="1" className="dark:stroke-white/10" />
          <line x1={0} y1={getY(50)} x2={width} y2={getY(50)} stroke="#e2e8f0" strokeDasharray="4" strokeWidth="1" className="dark:stroke-white/10" />
          <line x1={0} y1={getY(100)} x2={width} y2={getY(100)} stroke="#e2e8f0" strokeDasharray="4" strokeWidth="1" className="dark:stroke-white/10" />

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Fill Area */}
          <path
            d={`${pathD} L ${getX(chartData.length - 1)} ${height} L ${getX(0)} ${height} Z`}
            fill="url(#gradient)"
            className="transition-all duration-500"
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#6C63FF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm dark:stroke-dark-primary transition-all duration-500"
          />

          {/* Dots */}
          {chartData.map((point, i) => (
            <circle
              key={point.id}
              cx={getX(i)}
              cy={getY(point.score)}
              r="4"
              fill={point.score >= 70 ? "#00C896" : "#FF6584"}
              stroke="white"
              strokeWidth="2"
              className="dark:stroke-dark-surface transition-all duration-500"
            />
          ))}
        </svg>
      </div>
    </div>
  );
};