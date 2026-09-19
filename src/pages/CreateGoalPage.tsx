import React, { useState } from 'react';
import Layout from '../components/Layout';
import { GoalRepository } from '../services/GoalRepository';
import { CarbonGoal } from '../types/domain';
import { useNavigate, Link } from 'react-router-dom';

export default function CreateGoalPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState<number>(2);
  const [unit, setUnit] = useState('times');
  const [cadence, setCadence] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Default end date 7 days later
  const defaultEnd = new Date();
  defaultEnd.setDate(defaultEnd.getDate() + 7);
  const [endDate, setEndDate] = useState(defaultEnd.toISOString().split('T')[0]);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Goal title cannot be empty.');
      return;
    }
    if (targetValue <= 0) {
      setError('Target value must be greater than zero.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be before start date.');
      return;
    }

    const now = new Date().toISOString();
    const newGoal: CarbonGoal = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
      actionId: 'custom-behavior',
      title: title.trim(),
      metric: 'count',
      targetValue,
      unit,
      cadence,
      startDate,
      endDate,
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    GoalRepository.saveGoal(newGoal);
    navigate('/goals');
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <Link to="/goals" className="text-sm font-medium text-sky-600 hover:text-sky-700">
            &larr; Back to Goals
          </Link>
          <h1 className="text-3xl font-bold text-slate-950 mt-2">Create Reduction Goal</h1>
          <p className="text-sm text-slate-600">Define a real behavioral goal to track your carbon footprint actions.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-slate-700">Goal Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Use public transport or carpool"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Target Value</label>
              <input
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Unit / Label</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Cadence</label>
            <select
              value={cadence}
              onChange={(e) => setCadence(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm bg-white focus:border-sky-500 focus:ring-sky-500 text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm"
              />
            </div>
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium shadow-sm"
            >
              Create Goal
            </button>
            <Link
              to="/goals"
              className="bg-white text-slate-700 border border-slate-300 py-2 px-4 rounded-md hover:bg-slate-50 text-sm font-medium text-center shadow-sm"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
