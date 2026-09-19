import React, { useMemo } from 'react';
import Layout from '../components/Layout';
import { GoalRepository } from '../services/GoalRepository';

export default function GoalsPage() {
  const goals = useMemo(() => GoalRepository.getGoals(), []);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Carbon Reduction Goals</h1>
      
      {goals.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-500">No active goals yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map(goal => {
            const checkIns = GoalRepository.getCheckIns(goal.id);
            const progress = checkIns.reduce((sum, c) => sum + c.value, 0);
            const percentage = Math.min(100, (progress / goal.targetValue) * 100);

            return (
              <div key={goal.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{goal.title}</h2>
                    <p className="text-sm text-slate-500">{goal.cadence} goal</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${goal.status === 'active' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'}`}>
                    {goal.status}
                  </span>
                </div>
                
                <div className="w-full bg-slate-100 rounded-full h-4 mb-2">
                  <div className="bg-sky-600 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
                <p className="text-sm text-slate-600 font-medium">
                  {progress} / {goal.targetValue} {goal.unit} ({percentage.toFixed(0)}%)
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
