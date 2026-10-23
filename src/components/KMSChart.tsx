import React, { useState } from 'react';
import { ChildProfile, GrowthRecord } from '../types';
import { WHO_WEIGHT_BOYS, WHO_WEIGHT_GIRLS, WHO_HEIGHT_BOYS, WHO_HEIGHT_GIRLS } from '../utils/whoStandards';

interface KMSChartProps {
  child: ChildProfile;
  records: GrowthRecord[];
}

export const KMSChart: React.FC<KMSChartProps> = ({ child, records }) => {
  const [metric, setMetric] = useState<'weight' | 'height'>('weight');
  const [hoveredRecord, setHoveredRecord] = useState<GrowthRecord | null>(null);

  const isMale = child.gender === 'male';
  const rawStandards = metric === 'weight'
    ? (isMale ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS)
    : (isMale ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS);

  // SVG Dimension setups
  const width = 800;
  const height = 440;
  const padding = { top: 30, right: 40, bottom: 50, left: 55 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Max age on chart: 24 months for toddler focus or 60 months if older records exist
  const maxRecordedAge = Math.max(24, ...records.map(r => r.ageMonths));
  const maxMonth = maxRecordedAge > 24 ? Math.min(60, Math.ceil(maxRecordedAge / 6) * 6) : 24;

  const filteredStandards = rawStandards.filter(s => s.month <= maxMonth);

  // Y-axis range
  const minY = metric === 'weight' ? 1.5 : 40;
  const maxY = metric === 'weight'
    ? (maxMonth <= 24 ? 18 : 28)
    : (maxMonth <= 24 ? 100 : 125);

  const getX = (month: number) => padding.left + (month / maxMonth) * graphWidth;
  const getY = (val: number) => padding.top + graphHeight - ((val - minY) / (maxY - minY)) * graphHeight;

  // Generate SVG path for a given SD key
  const generatePath = (key: 'sd3neg' | 'sd2neg' | 'median' | 'sd2pos' | 'sd3pos') => {
    return filteredStandards
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.month)} ${getY(pt[key])}`)
      .join(' ');
  };

  // Generate area polygon between two curves
  const generateArea = (
    keyBottom: 'sd3neg' | 'sd2neg' | 'median' | 'sd2pos',
    keyTop: 'sd2neg' | 'median' | 'sd2pos' | 'sd3pos'
  ) => {
    const forward = filteredStandards.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.month)} ${getY(pt[keyTop])}`).join(' ');
    const backward = [...filteredStandards].reverse().map(pt => `L ${getX(pt.month)} ${getY(pt[keyBottom])}`).join(' ');
    return `${forward} ${backward} Z`;
  };

  // Child points
  const sortedRecords = [...records].sort((a, b) => a.ageMonths - b.ageMonths);
  const childPath = sortedRecords
    .map((r, i) => {
      const val = metric === 'weight' ? r.weight : r.height;
      return `${i === 0 ? 'M' : 'L'} ${getX(r.ageMonths)} ${getY(val)}`;
    })
    .join(' ');

  // Y grid ticks
  const yTickStep = metric === 'weight' ? (maxMonth <= 24 ? 2 : 3) : 10;
  const yTicks: number[] = [];
  for (let y = Math.ceil(minY / yTickStep) * yTickStep; y <= maxY; y += yTickStep) {
    yTicks.push(y);
  }

  // X grid ticks (months)
  const xTicks: number[] = [];
  const xStep = maxMonth <= 24 ? 2 : 6;
  for (let m = 0; m <= maxMonth; m += xStep) {
    xTicks.push(m);
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              {metric === 'weight' ? 'Kurva Pertumbuhan Berat Badan (KMS BB/U)' : 'Kurva Pertumbuhan Tinggi Badan (TB/U)'}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${isMale ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'}`}>
              Standar WHO {isMale ? 'Laki-laki' : 'Perempuan'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Garis hijau menandakan batas pertumbuhan normal ideal (-2 SD hingga +2 SD)
          </p>
        </div>

        {/* Metric Selector Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setMetric('weight')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              metric === 'weight' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Berat Badan (kg)
          </button>
          <button
            onClick={() => setMetric('height')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              metric === 'height' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tinggi Badan (cm)
          </button>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative w-full overflow-x-auto pt-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[650px] select-none"
        >
          {/* Background Shaded Bands */}
          {/* Normal Green Zone (-2 SD to +2 SD) */}
          <path
            d={generateArea('sd2neg', 'sd2pos')}
            fill="#dcfce7"
            opacity="0.8"
          />

          {/* Warning Yellow Zone Top (+2 SD to +3 SD) */}
          <path
            d={generateArea('sd2pos', 'sd3pos')}
            fill="#fef9c3"
            opacity="0.6"
          />

          {/* Warning Yellow Zone Bottom (-3 SD to -2 SD) */}
          <path
            d={generateArea('sd3neg', 'sd2neg')}
            fill="#fef9c3"
            opacity="0.7"
          />

          {/* Horizontal Grid lines & Y axis labels */}
          {yTicks.map(val => (
            <g key={`y-${val}`}>
              <line
                x1={padding.left}
                y1={getY(val)}
                x2={width - padding.right}
                y2={getY(val)}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <text
                x={padding.left - 10}
                y={getY(val) + 4}
                textAnchor="end"
                className="text-[11px] fill-slate-400 font-mono"
              >
                {val}
              </text>
            </g>
          ))}

          {/* Vertical Grid lines & X axis labels (Months) */}
          {xTicks.map(m => (
            <g key={`x-${m}`}>
              <line
                x1={getX(m)}
                y1={padding.top}
                x2={getX(m)}
                y2={height - padding.bottom}
                stroke="#e2e8f0"
                strokeDasharray="2 2"
              />
              <text
                x={getX(m)}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                className="text-[11px] fill-slate-500 font-mono"
              >
                {m} bln
              </text>
            </g>
          ))}

          {/* Standard Curve Lines */}
          {/* +3 SD */}
          <path d={generatePath('sd3pos')} fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />
          {/* +2 SD */}
          <path d={generatePath('sd2pos')} fill="none" stroke="#22c55e" strokeWidth="1.2" />
          {/* Median (0 SD) */}
          <path d={generatePath('median')} fill="none" stroke="#16a34a" strokeWidth="2" />
          {/* -2 SD */}
          <path d={generatePath('sd2neg')} fill="none" stroke="#22c55e" strokeWidth="1.2" />
          {/* -3 SD (Garis Merah Posyandu) */}
          <path d={generatePath('sd3neg')} fill="none" stroke="#ef4444" strokeWidth="1.8" />

          {/* Curve Labels at the right edge */}
          <text x={width - padding.right + 6} y={getY(filteredStandards[filteredStandards.length - 1].sd3pos) + 3} className="text-[9px] fill-amber-600 font-mono">+3 SD</text>
          <text x={width - padding.right + 6} y={getY(filteredStandards[filteredStandards.length - 1].median) + 3} className="text-[9px] fill-emerald-700 font-bold font-mono">0 SD</text>
          <text x={width - padding.right + 6} y={getY(filteredStandards[filteredStandards.length - 1].sd3neg) + 3} className="text-[9px] fill-rose-600 font-bold font-mono">-3 SD (BGM)</text>

          {/* Child's Growth Trajectory Line */}
          {sortedRecords.length > 1 && (
            <path
              d={childPath}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Child's Data Points */}
          {sortedRecords.map((r, i) => {
            const val = metric === 'weight' ? r.weight : r.height;
            const cx = getX(r.ageMonths);
            const cy = getY(val);
            const isHovered = hoveredRecord?.id === r.id;

            return (
              <g
                key={r.id}
                className="cursor-pointer"
                onClick={() => setHoveredRecord(hoveredRecord?.id === r.id ? null : r)}
                onTouchStart={() => setHoveredRecord(hoveredRecord?.id === r.id ? null : r)}
              >
                {/* Large transparent touch hit-target for smartphones */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={18}
                  fill="transparent"
                  className="cursor-pointer"
                />
                {/* Outer halo */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 9 : 5.5}
                  fill="#0284c7"
                  fillOpacity={isHovered ? 0.35 : 0.18}
                  className="transition-all"
                />
                {/* Main point */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5.5 : 4}
                  fill={isHovered ? '#0284c7' : '#0369a1'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredRecord(r)}
                  onMouseLeave={() => setHoveredRecord(null)}
                />
                {/* Label point value */}
                <text
                  x={cx}
                  y={cy - 10}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-sky-950 pointer-events-none font-mono"
                >
                  {val} {metric === 'weight' ? 'kg' : 'cm'}
                </text>
              </g>
            );
          })}

          {/* Axis Labels */}
          <text
            x={width / 2}
            y={height - 12}
            textAnchor="middle"
            className="text-xs font-medium fill-slate-500"
          >
            Usia Anak (Bulan)
          </text>
          <text
            transform={`rotate(-90)`}
            x={-(height / 2)}
            y={18}
            textAnchor="middle"
            className="text-xs font-medium fill-slate-500"
          >
            {metric === 'weight' ? 'Berat Badan (Kilogram)' : 'Tinggi Badan (Sentimeter)'}
          </text>
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredRecord && (
          <div className="absolute top-4 right-6 bg-slate-900 text-white text-xs p-3 rounded-lg shadow-lg pointer-events-none z-10 max-w-xs">
            <p className="font-semibold text-sky-300">Pengukuran: {hoveredRecord.date}</p>
            <div className="mt-1 space-y-0.5 text-slate-200">
              <p>Usia: <span className="font-mono text-white">{hoveredRecord.ageMonths} bulan</span></p>
              <p>Berat: <span className="font-mono text-white">{hoveredRecord.weight} kg</span></p>
              <p>Tinggi: <span className="font-mono text-white">{hoveredRecord.height} cm</span></p>
              {hoveredRecord.headCircumference && (
                <p>Lingkar Kepala: <span className="font-mono text-white">{hoveredRecord.headCircumference} cm</span></p>
              )}
              {hoveredRecord.location && (
                <p className="text-[11px] text-slate-400">Lokasi: {hoveredRecord.location}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend & KMS Guidance */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-200 border border-emerald-400 inline-block" />
            <span>Zona Normal (-2 s/d +2 SD)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-100 border border-amber-300 inline-block" />
            <span>Waspada (-3 s/d -2 SD)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-rose-500 inline-block" />
            <span>BGM / Garis Merah (&lt; -3 SD)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
            <span className="font-medium text-slate-800">Titik Data {child.name}</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400">
          Ref: Permenkes RI No. 2/2020 & WHO Multicentre Growth Reference Study
        </p>
      </div>
    </div>
  );
};
