import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { ActivityRepository } from '../services/ActivityRepository';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const records = useMemo(() => ActivityRepository.getAll(), []);
  const record = records.find(r => r.id === id);

  if (!record) {
    return (
      <Layout>
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-4 shadow-sm max-w-xl mx-auto my-12">
          <h2 className="text-2xl font-bold text-slate-950">Activity not found</h2>
          <p className="text-slate-600">The activity you are looking for does not exist or may have been deleted.</p>
          <div className="pt-2">
            <Link
              to="/activities"
              className="inline-flex items-center justify-center bg-sky-600 text-white font-medium py-2.5 px-6 rounded-md hover:bg-sky-750 transition-colors shadow-sm"
            >
              Back to Activities
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleDelete = () => {
    ActivityRepository.delete(record.id);
    navigate('/activities');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/activities" className="text-sm font-medium text-sky-600 hover:text-sky-700">
            &larr; Back to Activities
          </Link>
          <div className="flex space-x-3">
            <Link
              to={`/activities/${record.id}/edit`}
              className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-50 shadow-sm"
            >
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 shadow-sm"
            >
              Delete
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center justify-between">
            <p className="text-sm text-red-800 font-medium">Delete this activity? This will remove it from your tracking history.</p>
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
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
                {record.category}
              </span>
              <span className="text-sm text-slate-500">{record.localDate}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">{record.activityType}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Emissions</h2>
              <p className="text-3xl font-extrabold text-sky-600 mt-1">
                {record.estimatedCO2e.toFixed(2)} <span className="text-sm font-normal text-slate-500">{record.unit}</span>
              </p>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Data Quality</h2>
              <p className="text-lg font-semibold text-slate-800 mt-1">{record.dataQuality}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Inputs Provided</h2>
            <div className="bg-slate-50 p-4 rounded-md font-mono text-sm text-slate-700">
              {Object.entries(record.inputs).map(([key, val]) => (
                <div key={key} className="flex justify-between py-1">
                  <span className="text-slate-500">{key}:</span>
                  <span className="font-semibold">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 mb-2">How was this estimated?</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Calculated deterministically using verified emission factors and standardized input normalization.
            </p>
            <div className="bg-slate-50 p-4 rounded-md space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Emission Factor ID:</span>
                <span>{record.emissionFactorId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Factor Version:</span>
                <span>{record.emissionFactorVersion || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Source:</span>
                <span>{record.source}</span>
              </div>
            </div>
          </div>

          {record.assumptions && record.assumptions.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 mb-2">Assumptions</h2>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                {record.assumptions.map((assump, idx) => (
                  <li key={idx}>{assump}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
