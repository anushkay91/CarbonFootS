import React from 'react';
import { Link } from 'react-router-dom';

export function EmptyState() {
  return (
    <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-4 shadow-sm max-w-xl mx-auto my-12">
      <h2 className="text-2xl font-bold text-slate-950">Start tracking your footprint</h2>
      <p className="text-slate-600 leading-relaxed">
        You have not recorded any activities yet. Add your first activity to begin seeing your estimated footprint, coverage, and tracking trends.
      </p>
      <div className="pt-2">
        <Link
          to="/activities/new"
          className="inline-flex items-center justify-center bg-sky-600 text-white font-medium py-2.5 px-6 rounded-md hover:bg-sky-700 transition-colors shadow-sm"
        >
          Add Activity
        </Link>
      </div>
    </div>
  );
}
