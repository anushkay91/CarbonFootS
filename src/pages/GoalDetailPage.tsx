import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { GoalRepository } from '../services/GoalRepository';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GoalCheckIn } from '../types/domain';

export default function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [refreshKey, setRefreshKey] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [note, setNote] = useState('');

  const goals = useMemo(() => GoalRepository.getGoals(), [refreshKey]);
  const goal = goals.find(g => g.id === id);
  const checkIns = useMemo(() => (goal ? GoalRepository.getCheckIns(goal.id) : []), [goal, refreshKey]);

  if (!goal) {
    return (
      <Layout>
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-4 shadow-sm max-w-xl mx-auto my-12">
          <h2 className="text-2xl font-bold text-slate-950">Goal not found</h2>
          <p className="text-slate-600">The goal you are looking for does not exist or has been deleted.</p>
          <div className="pt-2">
            <Link
              to="/goals"
              className="inline-flex items-center justify-center bg-sky-600 text-white font-medium py-2.5 px-6 rounded-md hover:bg-sky-700 transition-colors shadow-sm"
            >
              Back to Goals
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const progress = checkIns.reduce((sum, c) => sum + (c.value > 0 ? c.value : 0), 0);
  const percentage = Math.min(100, (progress / goal.targetValue) * 100);
  const isCompleted = progress >= goal.targetValue;

  const handleCheckIn = (completed: boolean) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const checkIn: GoalCheckIn = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
      goalId: goal.id,
      date: todayStr,
      value: completed ? 1 : 0,
      source: 'self-reported',
      note: note.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    GoalRepository.saveCheckIn(checkIn);

    // Update goal status if target reached
    if (progress + (completed ? 1 : 0) >= goal.targetValue && goal.status === 'active') {
      GoalRepository.updateGoal({
        ...goal,
        status: 'completed',
        updatedAt: new Date().toISOString()
      });
    }

    setNote('');
    setRefreshKey(prev => prev + 1);
  };

  const handleDelete = () => {
    GoalRepository.deleteGoal(goal.id);
    navigate('/goals');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/goals" className="text-sm font-medium text-sky-600 hover:text-sky-700">
            &larr; Back to Goals
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 shadow-sm"
          >
            Delete Goal
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center justify-between">
            <p className="text-sm text-red-800 font-medium">Delete this goal? This will remove it and its check-in history.</p>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-white text-slate-700 border border-slate-300 px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 uppercase">
                {goal.cadence} goal
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">{goal.title}</h1>
              <p className="text-xs text-slate-500 mt-1">
                Active: {goal.startDate} to {goal.endDate}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isCompleted || goal.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}`}>
              {isCompleted || goal.status === 'completed' ? 'Completed' : 'Active'}
            </span>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-700">Progress</span>
              <span className="font-bold text-slate-900">{progress} / {goal.targetValue} {goal.unit} ({percentage.toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
              <div className="bg-sky-600 h-4 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
            </div>
          </div>

          {/* Check-in action section */}
          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Record Check-in</h2>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Optional Note / Context</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Carpooled with colleague"
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm bg-white focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
            <div className="flex space-x-3 pt-1">
              <button
                onClick={() => handleCheckIn(true)}
                className="flex-1 bg-emerald-600 text-white font-medium py-2 px-4 rounded-md hover:bg-emerald-700 text-sm shadow-sm"
              >
                Yes, Completed
              </button>
              <button
                onClick={() => handleCheckIn(false)}
                className="flex-1 bg-white text-slate-700 border border-slate-300 font-medium py-2 px-4 rounded-md hover:bg-slate-50 text-sm shadow-sm"
              >
                Not This Time
              </button>
            </div>
          </div>

          {/* Check-in history */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Check-in History</h2>
            {checkIns.length === 0 ? (
              <p className="text-sm text-slate-500">No check-ins recorded yet for this goal.</p>
            ) : (
              <div className="space-y-2">
                {checkIns.map((ci) => (
                  <div key={ci.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-md border border-slate-100 text-sm">
                    <div className="flex items-center space-x-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${ci.value > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      <span className="font-semibold text-slate-800">{ci.date}</span>
                      {ci.note && <span className="text-slate-500 text-xs">— {ci.note}</span>}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${ci.value > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                      {ci.value > 0 ? 'Completed' : 'Not completed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
