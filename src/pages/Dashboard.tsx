import React, { useMemo } from 'react';
import Layout from '../components/Layout';
import { ActivityRepository } from '../services/ActivityRepository';
import { TrackingSummaryEngine } from '../services/TrackingSummaryEngine';

export default function DashboardPage() {
  const records = useMemo(() => ActivityRepository.getAll(), []);
  
  // Example: Summary for the last 30 days
  const summary = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    return TrackingSummaryEngine.getSummary(records, thirtyDaysAgoStr, today);
  }, [records]);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700">Estimated Footprint (Last 30 Days)</h2>
          <p className="text-4xl font-bold text-sky-600 mt-2">{summary.totalCO2e.toFixed(2)} kg CO2e</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700">Data Coverage</h2>
          <p className="text-4xl font-bold text-slate-900 mt-2">{summary.coverageDays} days recorded</p>
        </div>
      </div>
    </Layout>
  );
}
