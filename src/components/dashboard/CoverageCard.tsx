import React from 'react';

interface CoverageCardProps {
  recordedDays: number;
  periodDays: number;
  hasData: boolean;
}

export function CoverageCard({ recordedDays, periodDays, hasData }: CoverageCardProps) {
  const coverageRatio = periodDays > 0 ? recordedDays / periodDays : 0;
  
  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Data Coverage</h2>
        <p className="text-3xl font-extrabold text-slate-900 mt-2">
          {recordedDays} of {periodDays} days
        </p>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
        {!hasData ? (
          <span className="text-amber-700 font-medium">No activity data recorded for this period. Missing data is not treated as zero emissions.</span>
        ) : coverageRatio < 1 ? (
          <span className="text-amber-700 font-medium">Incomplete coverage ({recordedDays} active days out of {periodDays}). Estimates are based on reported data only.</span>
        ) : (
          <span className="text-emerald-700 font-medium">Full daily coverage for the selected period.</span>
        )}
      </div>
    </div>
  );
}
