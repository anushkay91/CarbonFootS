import React, { useMemo } from 'react';
import Layout from '../components/Layout';
import { GoalRepository } from '../services/GoalRepository';
import { ActivityRepository } from '../services/ActivityRepository';
import { GoalAnalyticsEngine } from '../services/GoalAnalyticsEngine';
import { Link } from 'react-router-dom';

export default function GoalsPage() {
  const goals = useMemo(() => GoalRepository.getGoals(), []);
  const records = useMemo(() => ActivityRepository.getAll(), []);

  return (
    <Layout>
      <div className="bg-gradient-to-r from-sky-50/60 via-white to-slate-50/50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Target Reduction Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Carbon Reduction Goals</h1>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">Track activity-linked reduction targets, baseline comparisons, and progress milestones.</p>
        </div>
        <div className="flex-shrink-0">
          <Link
            to="/goals/new"
            className="inline-flex items-center justify-center bg-sky-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-sky-700 shadow-sm text-sm transition-all"
          >
            Create Goal
          </Link>
        </div>
      </div>
      
      {goals.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-4 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">No active goals yet.</h2>
          <p className="text-sm text-slate-600">Create an activity-linked reduction goal to connect your footprint records to actionable habits.</p>
          <div>
            <Link
              to="/goals/new"
              className="inline-flex items-center justify-center bg-sky-600 text-white font-medium py-2 px-4 rounded-md hover:bg-sky-700 text-sm shadow-sm"
            >
              Create Goal
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map(goal => {
            const analysis = GoalAnalyticsEngine.analyzeGoalProgress(goal, records);
            const percentage = Math.min(100, (analysis.currentValue / goal.targetValue) * 100);

            return (
              <div key={goal.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-800 uppercase">
                        {goal.cadence}
                      </span>
                      {analysis.isActivityLinked && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Activity Linked ({goal.linkedActivityType})
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{goal.startDate} to {goal.endDate}</span>
                    </div>
                    <Link to={`/goals/${goal.id}`} className="text-xl font-bold text-slate-900 hover:text-sky-600 mt-1 block">
                      {goal.title}
                    </Link>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${analysis.isAchieved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {analysis.isAchieved ? 'Target Achieved' : 'Action Required'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-md border border-slate-200/60 text-sm">
                  <div>
                    <span className="text-slate-500 block text-xs font-medium">Baseline Behavior</span>
                    <span className="font-bold text-slate-900">{analysis.baselineValue} {goal.unit}</span>
                    <span className="text-xs text-slate-500 block">({analysis.baselineCO2e.toFixed(1)} kg CO₂e)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs font-medium">Current Activity</span>
                    <span className="font-bold text-slate-900">{analysis.currentValue} {goal.unit}</span>
                    <span className="text-xs text-slate-500 block">({analysis.currentCO2e.toFixed(1)} kg CO₂e)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs font-medium">Estimated Carbon Change</span>
                    <span className={`font-bold ${analysis.changeCO2e < 0 ? 'text-emerald-700' : analysis.changeCO2e > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                      {analysis.changeCO2e < 0 ? `↓ ${Math.abs(analysis.changeCO2e).toFixed(1)} kg CO₂e` : analysis.changeCO2e > 0 ? `↑ ${analysis.changeCO2e.toFixed(1)} kg CO₂e` : 'No change'}
                    </span>
                    <span className="text-xs text-slate-500 block">relative to baseline</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">Goal Target Limit (≤ {goal.targetValue} {goal.unit})</span>
                    <span className="font-bold text-slate-900">{analysis.currentValue} / {goal.targetValue} {goal.unit} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className={`h-3 rounded-full transition-all ${analysis.isAchieved ? 'bg-emerald-600' : 'bg-amber-500'}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-600 italic mt-1">{analysis.statusMessage}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Automatically derived from canonical activity history</span>
                  <Link
                    to={`/goals/${goal.id}`}
                    className="bg-white text-slate-700 border border-slate-300 px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-50 shadow-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
