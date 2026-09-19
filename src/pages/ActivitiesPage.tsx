import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { ActivityRepository } from '../services/ActivityRepository';
import { Link } from 'react-router-dom';
import { ActivityRecord } from '../types/domain';

export default function ActivitiesPage() {
  const [records, setRecords] = useState<ActivityRecord[]>(() => ActivityRepository.getAll());
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRefresh = () => {
    setRecords(ActivityRepository.getAll());
  };

  const handleDelete = (id: string) => {
    ActivityRepository.delete(id);
    handleRefresh();
    setDeletingId(null);
  };

  const filteredAndSortedRecords = useMemo(() => {
    let list = [...records];

    // Category filter
    if (categoryFilter !== 'All') {
      list = list.filter(r => r.category === categoryFilter);
    }

    // Date filter
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (dateFilter === 'today') {
      list = list.filter(r => r.localDate === todayStr);
    } else if (dateFilter === '7days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      list = list.filter(r => r.localDate >= cutoffStr);
    } else if (dateFilter === '30days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      list = list.filter(r => r.localDate >= cutoffStr);
    }

    // Sorting (immutable)
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime();
      } else if (sortBy === 'highest') {
        return b.estimatedCO2e - a.estimatedCO2e;
      } else if (sortBy === 'lowest') {
        return a.estimatedCO2e - b.estimatedCO2e;
      }
      return 0;
    });

    return list;
  }, [records, categoryFilter, dateFilter, sortBy]);

  const clearFilters = () => {
    setCategoryFilter('All');
    setDateFilter('all');
    setSortBy('newest');
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Activity History</h1>
          <p className="text-slate-600 text-sm mt-1">Manage, view, and inspect all recorded carbon activities.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/activities/new"
            className="inline-flex items-center justify-center bg-sky-600 text-white font-medium py-2 px-4 rounded-md hover:bg-sky-700 shadow-sm text-sm"
          >
            Add Activity
          </Link>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm bg-white focus:border-sky-500 focus:ring-sky-500"
          >
            <option value="All">All Categories</option>
            <option value="Transportation">Transportation</option>
            <option value="Electricity">Electricity</option>
            <option value="Food">Food</option>
            <option value="Shopping">Shopping</option>
            <option value="Waste">Waste</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Date Range</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm bg-white focus:border-sky-500 focus:ring-sky-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm bg-white focus:border-sky-500 focus:ring-sky-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Estimated CO₂e</option>
            <option value="lowest">Lowest Estimated CO₂e</option>
          </select>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-4 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">No activities recorded yet.</h2>
          <p className="text-sm text-slate-600">Add your first activity to start tracking your footprint.</p>
          <div>
            <Link
              to="/activities/new"
              className="inline-flex items-center justify-center bg-sky-600 text-white font-medium py-2 px-4 rounded-md hover:bg-sky-700 text-sm shadow-sm"
            >
              Add Activity
            </Link>
          </div>
        </div>
      ) : filteredAndSortedRecords.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-4 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">No activities match the selected filters.</h2>
          <p className="text-sm text-slate-600">Try adjusting your category or date range filters.</p>
          <div>
            <button
              onClick={clearFilters}
              className="inline-flex items-center justify-center bg-white text-slate-700 border border-slate-300 font-medium py-2 px-4 rounded-md hover:bg-slate-50 text-sm shadow-sm"
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedRecords.map((record) => (
            <div key={record.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-800">
                      {record.category}
                    </span>
                    <span className="text-xs text-slate-400">{record.localDate}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{record.activityType}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-sky-600">{record.estimatedCO2e.toFixed(2)} <span className="text-xs font-normal text-slate-500">kg CO₂e</span></p>
                  <p className="text-xs text-slate-400">Quality: {record.dataQuality}</p>
                </div>
              </div>

              {deletingId === record.id && (
                <div className="bg-red-50 border border-red-200 p-3 rounded flex items-center justify-between text-sm">
                  <span className="text-red-800 font-medium">Delete this activity? This will remove it from your tracking history.</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setDeletingId(null)}
                      className="bg-white text-slate-700 border border-slate-300 px-2.5 py-1 rounded text-xs font-medium hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="bg-red-600 text-white px-2.5 py-1 rounded text-xs font-medium hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-500 text-xs font-mono">
                  Inputs: {JSON.stringify(record.inputs)}
                </span>
                <div className="flex space-x-3">
                  <Link
                    to={`/activities/${record.id}`}
                    className="font-medium text-sky-600 hover:text-sky-700"
                  >
                    View
                  </Link>
                  <Link
                    to={`/activities/${record.id}/edit`}
                    className="font-medium text-slate-700 hover:text-slate-900"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeletingId(record.id)}
                    className="font-medium text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
