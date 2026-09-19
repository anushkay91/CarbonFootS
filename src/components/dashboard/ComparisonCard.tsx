import React from 'react';
import { PeriodComparison } from '../../types/domain';

interface ComparisonCardProps {
  comparison?: PeriodComparison;
}

export function ComparisonCard({ comparison }: ComparisonCardProps) {
  if (!comparison || comparison.status === 'no-previous-data' || comparison.previousTotal === null) {
    return (
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Period Comparison</h2>
          <p className="text-base font-medium text-slate-600 mt-3">No previous comparable period data available.</p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
          Comparison requires activity records in both periods.
        </div>
      </div>
    );
  }

  const { currentTotal, previousTotal, percentageChange, status } = comparison;
  const isLower = currentTotal < previousTotal;

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Compared With Previous Period</h2>
        <div className="mt-2 flex items-baseline space-x-3">
          <span className="text-2xl font-bold text-slate-900">{currentTotal.toFixed(1)} kg</span>
          <span className="text-sm text-slate-500">vs prev {previousTotal.toFixed(1)} kg</span>
        </div>
        {percentageChange !== null && (
          <div className="mt-2 flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${isLower ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {percentageChange > 0 ? `+${percentageChange}%` : `${percentageChange}%`}
            </span>
            <span className="text-xs text-slate-600">
              {isLower ? 'Emissions lower than previous period.' : 'Emissions higher than previous period.'}
            </span>
          </div>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
        {status === 'not-comparable' ? (
          <span className="text-amber-700 font-medium">Comparison limited because recorded activity coverage differs between periods.</span>
        ) : (
          <span>Comparable period duration and coverage matched.</span>
        )}
      </div>
    </div>
  );
}
