import React from 'react';

interface FootprintSummaryCardProps {
  totalCO2e: number;
  activityCount: number;
}

export function FootprintSummaryCard({ totalCO2e, activityCount }: FootprintSummaryCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Footprint</h2>
        <p className="text-4xl font-extrabold text-slate-900 mt-2">
          {totalCO2e.toFixed(2)} <span className="text-lg font-normal text-slate-500">kg CO₂e</span>
        </p>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">{activityCount}</span> {activityCount === 1 ? 'activity recorded' : 'activities recorded'}
      </div>
    </div>
  );
}
