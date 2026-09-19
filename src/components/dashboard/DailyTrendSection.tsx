import React, { useState } from 'react';
import { DailyDataItem } from '../../types/domain';
import { TrendingUp, Calendar, Info } from 'lucide-react';

interface DailyTrendSectionProps {
  dailyBreakdown: DailyDataItem[];
}

export function DailyTrendSection({ dailyBreakdown }: DailyTrendSectionProps) {
  const [hoveredPoint, setHoveredPoint] = useState<DailyDataItem | null>(null);

  const maxEmission = Math.max(1, ...dailyBreakdown.map(d => d.totalCO2e || 0));
  const chartHeight = 220;
  const chartWidth = 700;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const usableWidth = chartWidth - paddingLeft - paddingRight;
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const points = dailyBreakdown.map((day, index) => {
    const x = paddingLeft + (dailyBreakdown.length > 1 ? (index / (dailyBreakdown.length - 1)) * usableWidth : usableWidth / 2);
    const val = day.hasData && day.totalCO2e !== null ? day.totalCO2e : 0;
    const y = paddingTop + usableHeight - (val / maxEmission) * usableHeight;
    return { x, y, day, val };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Area under line
  const firstPt = points[0];
  const lastPt = points[points.length - 1];
  const areaD = firstPt && lastPt ? `${pathD} L ${lastPt.x} ${paddingTop + usableHeight} L ${firstPt.x} ${paddingTop + usableHeight} Z` : '';

  const yTicks = [0, maxEmission * 0.5, maxEmission];

  const accessibleSummary = dailyBreakdown
    .map(d => `${d.date}: ${d.hasData && d.totalCO2e !== null ? `${d.totalCO2e.toFixed(1)} kg CO₂e` : 'no emissions'}`)
    .join(', ');

  return (
    <div className="bg-gradient-to-r from-sky-50/60 via-white to-slate-50/50 p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/60 pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2">
            <TrendingUp className="w-3 h-3" />
            <span>Temporal Line Graph</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Daily Carbon Footprint Trend</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">X-axis tracking dates alongside Y-axis carbon footprint values in kg CO₂e.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-sky-600" />
          <span>{dailyBreakdown.length} days period</span>
        </div>
      </div>

      <span className="sr-only">Daily emission summary: {accessibleSummary}</span>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[550px] overflow-visible">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y-axis grid lines and ticks */}
          {yTicks.map((tick, idx) => {
            const y = paddingTop + usableHeight - (tick / maxEmission) * usableHeight;
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] font-medium fill-slate-400">
                  {tick.toFixed(1)} kg
                </text>
              </g>
            );
          })}

          {/* Area under curve */}
          {areaD && <path d={areaD} fill="url(#trendGradient)" />}

          {/* Line graph path */}
          {pathD && <path d={pathD} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Data points & hover interaction */}
          {points.map((pt, idx) => {
            const isHovered = hoveredPoint?.date === pt.day.date;
            return (
              <g key={pt.day.date} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(pt.day)} onMouseLeave={() => setHoveredPoint(null)}>
                {/* Invisible larger hit target */}
                <circle cx={pt.x} cy={pt.y} r={10} fill="transparent" />

                {/* Point circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  className={`transition-all duration-150 ${pt.day.hasData ? 'fill-sky-600 stroke-white stroke-2' : 'fill-slate-300 stroke-white'}`}
                />

                {/* X-axis date labels (show every few days if large or all if small) */}
                {(dailyBreakdown.length <= 15 || idx % Math.ceil(dailyBreakdown.length / 10) === 0 || idx === dailyBreakdown.length - 1) && (
                  <text x={pt.x} y={chartHeight - 10} textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">
                    {pt.day.date.slice(5)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none space-y-0.5 z-10 border border-slate-700">
            <div className="font-semibold text-sky-300">{hoveredPoint.date}</div>
            <div>
              Carbon: <span className="font-bold text-emerald-400">{hoveredPoint.totalCO2e !== null ? `${hoveredPoint.totalCO2e.toFixed(2)} kg CO₂e` : '0.00 kg CO₂e'}</span>
            </div>
            <div className="text-[10px] text-slate-400">{hoveredPoint.activityCount} recorded activities</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-xs text-slate-500 font-medium">
        <div className="flex items-center space-x-2">
          <Info className="w-3.5 h-3.5 text-sky-600" />
          <span>Y-Axis: Carbon Footprint (kg CO₂e) | X-Axis: Date Timeline</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span>
            <span>Daily Emissions</span>
          </span>
        </div>
      </div>
    </div>
  );
}
