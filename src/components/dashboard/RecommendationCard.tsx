import React, { useState } from 'react';
import { Recommendation } from '../../services/RecommendationEngine';
import { Link } from 'react-router-dom';
import { ScenarioModal } from './ScenarioModal';
import { ActivityRecord, CarbonGoal } from '../../types/domain';

interface RecommendationCardProps {
  recommendation: Recommendation;
  records: ActivityRecord[];
  activeGoal?: CarbonGoal;
}

export function RecommendationCard({ recommendation, records, activeGoal }: RecommendationCardProps) {
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const isNoData = recommendation.reasonCode === 'NO_DATA' || recommendation.reasonCode === 'LIMITED_DATA';

  return (
    <>
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            Next Action (Deterministic Insight)
          </span>
          <span className="text-xs font-medium text-slate-500 capitalize">
            Data Quality: {recommendation.dataQuality}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">{recommendation.title}</h3>
          <p className="text-sm font-medium text-slate-700">{recommendation.action}</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-md border border-slate-200/60 space-y-2 text-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Why this appeared</span>
            <p className="text-slate-700 mt-0.5">{recommendation.reasonText}</p>
          </div>

          {!isNoData && recommendation.potentialReduction && (
            <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-600">Estimated potential reduction if target reached:</span>
              <span className="text-sm font-bold text-emerald-700">
                ≈ {recommendation.potentialReduction.value} {recommendation.potentialReduction.unit}
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-wrap gap-2">
          {!isNoData && (
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="bg-emerald-600 text-white px-3.5 py-2 rounded-md text-xs font-medium hover:bg-emerald-700 shadow-sm inline-flex items-center"
            >
              Explore What-If Impact &rarr;
            </button>
          )}
          <Link
            to="/goals"
            className="bg-sky-600 text-white px-3.5 py-2 rounded-md text-xs font-medium hover:bg-sky-700 shadow-sm inline-flex items-center"
          >
            View Goals
          </Link>
          <Link
            to="/activities/new"
            className="bg-white text-slate-700 border border-slate-300 px-3.5 py-2 rounded-md text-xs font-medium hover:bg-slate-50 shadow-sm inline-flex items-center"
          >
            Record Activity
          </Link>
        </div>
      </div>

      <ScenarioModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        recommendation={recommendation}
        activeGoal={activeGoal}
        records={records}
      />
    </>
  );
}
