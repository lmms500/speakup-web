import React, { useState, useMemo } from 'react';
import { AnalysisResult } from '../types';
import { Activity, Zap, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ChartProps {
  data: AnalysisResult[];
}

type ChartMetric = 'score' | 'wpm' | 'vicios';

export const Chart: React.FC<ChartProps> = ({ data }) => {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('score');
  const { t } = useLanguage();

  const chartData = useMemo(() => {
    return [...data].slice(0, 10).reverse();
  }, [data]);

  if (chartData.length < 2) {
    return (
      <div className="w-full bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5 mb-6 text-center">
        <p className="text-slate-400 text-sm">{t('hist_empty_desc')}</p>
      </div>
    );
  }

  const averages = useMemo(() => {
    const total = chartData.length;
    if (total === 0) return { score: 0, wpm: 0, vicios: 0 };

    const sumScore = chartData.reduce((acc, curr) => acc + curr.score, 0);
    const sumWpm = chartData.reduce((acc, curr) => acc + (curr.wpm || 0), 0);
    const sumVicios = chartData.reduce((acc, curr) => acc + curr.vicios_linguagem_count, 0);

    return {
      score: Math.round(sumScore / total),
      wpm: Math.round(sumWpm / total),
      vicios: (sumVicios / total).toFixed(1)
    };
  }, [chartData]);

  const width = 300;
  const height = 120;
  const padding = 10;

  const config = {
    score: {
      label: t('chart_avg_score'),
      tabLabel: t('chart_tab_score'),
      color: '#6C63FF',
      icon: <Activity size={14} />,
      getValue: (d: AnalysisResult) => d.score,
      currentAverage: averages.score,
      format: (v: number | string) => v.toString(),
      min: 0,
      max: 100
    },
    wpm: {
      label: t('chart_avg_ppm'),
      tabLabel: t('chart_tab_ppm'),
      color: '#00C896',
      icon: <Zap size={14} />,
      getValue: (d: AnalysisResult) => d.wpm || 0,
      currentAverage: averages.wpm,
      format: (v: number | string) => `${v} ppm`,
      min: 0,
      max: Math.max(...chartData.map(d => d.wpm || 0), 200) + 20 
    },
    vicios: {
      label: t('chart_avg_vices'),
      tabLabel: t('chart_tab_vices'),
      color: '#FF6584',
      icon: <AlertTriangle size={14} />,
      getValue: (d: AnalysisResult) => d.vicios_linguagem_count,
      currentAverage: averages.vicios,
      format: (v: number | string) => v.toString(),
      min: 0,
      max: Math.max(...chartData.map(d => d.vicios_linguagem_count), 5) + 2
    }
  };

  const currentConfig = config[activeMetric];

  const getX = (index: number) => {
    return padding + (index / (chartData.length - 1)) * (width - 2 * padding);
  };

  const getY = (value: number) => {
    const { min, max } = currentConfig;
    if (max === min) return height / 2;
    return height - padding - ((value - min) / (max - min)) * (height - 2 * padding);
  };

  let pathD = "";
  chartData.forEach((point, i) => {
    const val = currentConfig.getValue(point);
    if (i === 0) pathD += `M ${getX(i)} ${getY(val)}`;
    else pathD += ` L ${getX(i)} ${getY(val)}`;
  });

  const fillPath = `${pathD} L ${getX(chartData.length - 1)} ${height} L ${getX(0)} ${height} Z`;

  return (
    <div className="w-full bg-white dark:bg-[#1E1E1E] rounded-3xl p-5 shadow-soft dark:shadow-dark-soft border border-slate-100 dark:border-white/5 mb-6 transition-colors">
      
      <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl mb-6 overflow-hidden">
        {(Object.keys(config) as ChartMetric[]).map((metric) => {
          const isActive = activeMetric === metric;
          return (
            <button
              key={metric}
              onClick={() => setActiveMetric(metric)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all duration-300
                ${isActive 
                  ? 'bg-white dark:bg-white/10 text-brand-charcoal dark:text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}
              `}
            >
              {config[metric].icon}
              <span className="hidden sm:inline">{config[metric].tabLabel}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-end mb-2 px-2">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          {currentConfig.label} <span className="opacity-50 normal-case">({chartData.length})</span>
        </h3>
        <div className="text-3xl font-heading font-bold text-brand-charcoal dark:text-white" style={{ color: currentConfig.color }}>
          {currentConfig.format(currentConfig.currentAverage)}
        </div>
      </div>
      
      <div className="relative w-full h-32 flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`gradient-${activeMetric}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={currentConfig.color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={currentConfig.color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((tick) => (
            <line 
              key={tick}
              x1={0} 
              y1={height - padding - (tick * (height - 2 * padding))} 
              x2={width} 
              y2={height - padding - (tick * (height - 2 * padding))} 
              stroke="currentColor" 
              strokeOpacity="0.05" 
              strokeDasharray="4" 
              strokeWidth="1" 
              className="text-slate-500" 
            />
          ))}

          <path
            d={fillPath}
            fill={`url(#gradient-${activeMetric})`}
            className="transition-all duration-500"
          />

          <path
            d={pathD}
            fill="none"
            stroke={currentConfig.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm transition-all duration-500"
          />

          {chartData.map((point, i) => {
            const val = currentConfig.getValue(point);
            return (
              <circle
                key={point.id}
                cx={getX(i)}
                cy={getY(val)}
                r="4"
                fill={currentConfig.color}
                stroke="white"
                strokeWidth="2"
                className="dark:stroke-[#1E1E1E] transition-all duration-500"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};