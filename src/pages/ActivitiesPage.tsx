import React, { useMemo } from 'react';
import Layout from '../components/Layout';
import { ActivityRepository } from '../services/ActivityRepository';
import { Link } from 'react-router-dom';

export default function ActivitiesPage() {
  const records = useMemo(() => ActivityRepository.getAll(), []);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Activity History</h1>
        <Link to="/activities/new" className="bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700">Add Activity</Link>
      </div>
      
      {records.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-500">No activities recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()).map(record => (
            <div key={record.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-900">{record.category}: {record.activityType}</p>
                <p className="text-sm text-slate-500">{record.localDate}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sky-600">{record.estimatedCO2e.toFixed(2)} kg CO2e</p>
                <p className="text-xs text-slate-400">Quality: {record.dataQuality}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
