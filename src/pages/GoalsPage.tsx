import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { GoalRepository } from '../services/GoalRepository';
import { Link } from 'react-router-dom';
import { GoalCheckIn } from '../types/domain';

export default function GoalsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const goals = useMemo(() => GoalRepository.getGoals(), [refreshKey]);

  const handleQuickCheckIn = (goalId: string, targetValue: number) => {
    const checkIns = GoalRepository.getCheckIns(goalId);
    const currentProgress = checkIns.reduce((sum, c) => sum + (c.value > 0 ? c.value : 0), 0);
    const todayStr = new Date().toISOString().split('T')[0];

    const checkIn: GoalCheckIn = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
      goalId,
      date: todayStr,
      value: 1,
      source: 'self-reported',
      createdAt: new Date().toISOString()
    };

    GoalRepository.saveCheckIn(checkIn);

    const goal = goals.find(g => g.id === goalId);
    if (goal && currentProgress + 1 >= targetValue && goal.status === 'active') {
      GoalRepository.updateGoal({
        ...goal,
        status: 'completed',
        updatedAt: new Date().toISOString()
      });
    }

    setRefreshKey(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Carbon Reduction Goals</h1>
          <p className="text-slate-600 text-sm mt-1">Track behavioral goals, record check-ins, and build sustainable habits.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/goals/new"
            className="inline-flex items-center justify-center bg-sky-600 text-white font-medium py-2 px-4 rounded-md hover:bg-sky-700 shadow-sm text-sm"
          >
            Create Goal
          </Link>
        </div>
      </div>
      
      {goals.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-4 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">No active goals yet.</h2>
          <p className="text-sm text-slate-600">Create your first behavioral goal to start turning footprint tracking into action.</p>
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
            const checkIns = GoalRepository.getCheckIns(goal.id);
            const progress = checkIns.reduce((sum, c) => sum + (c.value > 0 ? c.value : 0), 0);
            const percentage = Math.min(100, (progress / goal.targetValue) * 100);
            const isCompleted = progress >= goal.targetValue || goal.status === 'completed';

            return (
              <div key={goal.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-800 uppercase">
                        {goal.cadence}
                      </span>
                      <span className="text-xs text-slate-400">{goal.startDate} to {goal.endDate}</span>
                    </div>
                    <Link to={`/goals/${goal.id}`} className="text-xl font-bold text-slate-900 hover:text-sky-600 mt-1 block">
                      {goal.title}
                    </Link>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}`}>
                    {isCompleted ? 'Completed' : 'Active'}
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">Progress</span>
                    <span className="font-bold text-slate-900">{progress} / {goal.targetValue} {goal.unit} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-sky-600 h-3 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{checkIns.length} check-ins recorded</span>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleQuickCheckIn(goal.id, goal.targetValue)}
                      className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-emerald-700 shadow-sm"
                    >
                      + Check In
                    </button>
                    <Link
                      to={`/goals/${goal.id}`}
                      className="bg-white text-slate-700 border border-slate-300 px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-50 shadow-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
