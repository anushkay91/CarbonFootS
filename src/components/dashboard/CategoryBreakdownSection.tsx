import React from 'react';

interface CategoryBreakdownSectionProps {
  categoryTotals: Record<string, number>;
  totalCO2e: number;
}

export function CategoryBreakdownSection({ categoryTotals, totalCO2e }: CategoryBreakdownSectionProps) {
  const categories = Object.entries(categoryTotals);

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Category Breakdown</h2>
      {categories.length === 0 ? (
        <p className="text-sm text-slate-500">No category data recorded for this period. Unrecorded categories are not assumed to be zero.</p>
      ) : (
        <div className="space-y-4">
          {categories.map(([category, value]) => {
            const percentage = totalCO2e > 0 ? (value / totalCO2e) * 100 : 0;
            return (
              <div key={category} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-900">{category}</span>
                  <span className="font-bold text-slate-700">{value.toFixed(2)} kg ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-sky-600 h-2.5 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
