import React, { useState } from 'react';
import { CategoryDetailSummary } from '../../types/domain';

interface CategoryBreakdownSectionProps {
  categoryDetails: Record<string, CategoryDetailSummary>;
  totalCO2e: number;
}

export function CategoryBreakdownSection({ categoryDetails, totalCO2e }: CategoryBreakdownSectionProps) {
  const detailsList = Object.values(categoryDetails);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    detailsList.length > 0 ? detailsList[0].category : null
  );

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Category & Subcategory Breakdown</h2>
        <span className="text-xs text-slate-500 font-medium">Click category to drill down</span>
      </div>

      {detailsList.length === 0 ? (
        <p className="text-sm text-slate-500">No category data recorded for this period. Unrecorded categories are not assumed to be zero.</p>
      ) : (
        <div className="space-y-4">
          {detailsList.map((detail) => {
            const isExpanded = expandedCategory === detail.category;
            return (
              <div key={detail.category} className="border border-slate-200 rounded-lg p-4 space-y-3 transition-colors bg-slate-50/50">
                <div 
                  onClick={() => setExpandedCategory(isExpanded ? null : detail.category)}
                  className="cursor-pointer select-none space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-base">{detail.category}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                        {detail.activityCount} {detail.activityCount === 1 ? 'activity' : 'activities'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900">{detail.totalCO2e.toFixed(2)} kg</span>
                      <span className="text-xs text-slate-500 ml-1.5 font-medium">({detail.shareOfTotal.toFixed(1)}%)</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-sky-600 h-2.5 rounded-full transition-all" style={{ width: `${detail.shareOfTotal}%` }}></div>
                  </div>
                </div>

                {/* Drill-down Subcategories */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setExpandedCategory(isExpanded ? null : detail.category)}
                    className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center space-x-1 focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-0.5"
                    aria-expanded={isExpanded}
                  >
                    <span>{isExpanded ? 'Hide subcategory details' : 'View subcategory details'}</span>
                    <span aria-hidden="true">{isExpanded ? '▲' : '▼'}</span>
                  </button>
                  {detail.largestSubtype && (
                    <span className="text-xs text-slate-500 font-medium">
                      Largest: <strong className="text-slate-700">{detail.largestSubtype}</strong>
                    </span>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-3 pl-3 border-l-2 border-sky-500 space-y-2.5 pt-1 animate-fadeIn">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Subcategory Breakdown ({detail.category})</h4>
                    {detail.subcategories.map((sub) => (
                      <div key={sub.activityType} className="bg-white p-3 rounded border border-slate-200 shadow-2xs space-y-1.5">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-semibold text-slate-800">{sub.activityType}</span>
                          <span className="font-bold text-slate-900">{sub.totalCO2e.toFixed(2)} kg <span className="text-xs text-slate-500 font-normal">({sub.shareOfCategory.toFixed(1)}% of category)</span></span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${sub.shareOfCategory}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{sub.activityCount} {sub.activityCount === 1 ? 'record' : 'records'}</span>
                          <span>{sub.shareOfTotal.toFixed(1)}% of total footprint</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
