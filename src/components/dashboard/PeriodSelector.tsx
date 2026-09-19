import React from 'react';

interface PeriodSelectorProps {
  selectedDays: number;
  onSelectDays: (days: number) => void;
}

export function PeriodSelector({ selectedDays, onSelectDays }: PeriodSelectorProps) {
  return (
    <div className="flex space-x-2 mb-6" aria-label="Select tracking period">
      {[7, 30, 90].map((days) => (
        <button
          key={days}
          onClick={() => onSelectDays(days)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedDays === days
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Last {days} Days
        </button>
      ))}
    </div>
  );
}
