import React from 'react';

interface LargestSourceCardProps {
  largestSource?: string;
  categoryTotals: Record<string, number>;
}

export function LargestSourceCard({ largestSource, categoryTotals }: LargestSourceCardProps) {
  const value = largestSource ? categoryTotals[largestSource] : undefined;

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Largest Reported Source</h2>
        {largestSource && value !== undefined ? (
          <div className="mt-2">
            <p className="text-2xl font-bold text-slate-900">{largestSource}</p>
            <p className="text-sm text-sky-700 font-semibold mt-1">{value.toFixed(2)} kg CO₂e</p>
          </div>
        ) : (
          <p className="text-slate-500 mt-3 text-sm">No recorded sources for this period.</p>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
        Based on recorded estimated emissions.
      </div>
    </div>
  );
}
