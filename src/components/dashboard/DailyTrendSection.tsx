import React from 'react';
import { DailyDataItem } from '../../types/domain';

interface DailyTrendSectionProps {
  dailyBreakdown: DailyDataItem[];
}

export function DailyTrendSection({ dailyBreakdown }: DailyTrendSectionProps) {
  const maxEmission = Math.max(1, ...dailyBreakdown.map(d => d.totalCO2e || 0));

  const accessibleSummary = dailyBreakdown
    .map(d => `${d.date}: ${d.hasData && d.totalCO2e !== null ? `${d.totalCO2e.toFixed(1)} kg CO₂e` : 'no activity data recorded'}`)
    .join(', ');

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-900">Daily Trend</h2>
        <span className="text-xs text-slate-500">Estimated emissions per day</span>
      </div>

      <span className="sr-only">Daily emission summary: {accessibleSummary}</span>

      <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 gap-1.5 items-end h-40 pt-4 border-b border-slate-100">
        {dailyBreakdown.map((day) => {
          const heightPercent = day.hasData && day.totalCO2e !== null ? Math.max(10, (day.totalCO2e / maxEmission) * 100) : 0;
          return (
            <div key={day.date} className="flex flex-col items-center h-full justify-end group relative">
              <div
                className={`w-full rounded-t transition-all ${
                  day.hasData && day.totalCO2e !== null ? 'bg-sky-600 hover:bg-sky-700' : 'bg-slate-100 h-1'
                }`}
                style={{ height: `${heightPercent}%` }}
                title={`${day.date}: ${day.hasData && day.totalCO2e !== null ? `${day.totalCO2e.toFixed(2)} kg` : 'No data recorded'}`}
              ></div>
              <span className="text-[10px] text-slate-400 mt-1 truncate w-full text-center">
                {day.date.slice(8)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>Start: {dailyBreakdown[0]?.date}</span>
        <span>End: {dailyBreakdown[dailyBreakdown.length - 1]?.date}</span>
      </div>
    </div>
  );
}
