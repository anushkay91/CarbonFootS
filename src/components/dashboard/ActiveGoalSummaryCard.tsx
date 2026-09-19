import React from 'react';
import { CarbonGoal, ActivityRecord } from '../../types/domain';
import { GoalAnalyticsEngine } from '../../services/GoalAnalyticsEngine';
import { Link } from 'react-router-dom';

interface ActiveGoalSummaryCardProps {
  goal: CarbonGoal;
  records: ActivityRecord[];
}

export function ActiveGoalSummaryCard({ goal, records }: ActiveGoalSummaryCardProps) {
  const analysis = GoalAnalyticsEngine.analyzeGoalProgress(goal, records);
  const percentage = Math.min(100, (analysis.currentValue / goal.targetValue) * 100);

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
            Active Goal ({goal.cadence})
          </span>
          {goal.linkedActivityType && (
            <span className="text-xs text-slate-500 font-medium">({goal.linkedActivityType})</span>
          )}
        </div>
        <Link to="/goals" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
          View All Goals &rarr;
        </Link>
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-900">{goal.title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">Target limit: ≤ {goal.targetValue} {goal.unit}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-md border border-slate-200/60 text-center">
        <div>
          <span className="text-xs text-slate-500 block">Baseline</span>
          <span className="text-sm font-bold text-slate-900">{analysis.baselineValue} {goal.unit}</span>
        </div>
        <div>
          <span className="text-xs text-slate-500 block">Current</span>
          <span className="text-sm font-bold text-slate-900">{analysis.currentValue} {goal.unit}</span>
        </div>
        <div>
          <span className="text-xs text-slate-500 block">Carbon Change</span>
          <span className={`text-sm font-bold ${analysis.changeCO2e < 0 ? 'text-emerald-700' : analysis.changeCO2e > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
            {analysis.changeCO2e < 0 ? `↓ ${Math.abs(analysis.changeCO2e).toFixed(1)} kg` : analysis.changeCO2e > 0 ? `↑ ${analysis.changeCO2e.toFixed(1)} kg` : 'Stable'}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-slate-700">
          <span>Progress</span>
          <span>{percentage.toFixed(0)}% of limit</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div className={`h-2 rounded-full transition-all ${analysis.isAchieved ? 'bg-emerald-600' : 'bg-amber-500'}`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}
