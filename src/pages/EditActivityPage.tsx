import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { ActivityRepository } from '../services/ActivityRepository';
import { CarbonCalculator } from '../services/carbonCalculator';
import { DataQuality } from '../types/domain';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function EditActivityPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const records = useMemo(() => ActivityRepository.getAll(), []);
  const record = records.find(r => r.id === id);

  const initialDistance = record && record.inputs && typeof record.inputs.distanceKm === 'number' ? record.inputs.distanceKm : 0;
  const initialDate = record ? record.localDate : new Date().toISOString().split('T')[0];

  const [distanceKm, setDistanceKm] = useState<number>(initialDistance);
  const [date, setDate] = useState<string>(initialDate);
  const [error, setError] = useState<string | null>(null);

  if (!record) {
    return (
      <Layout>
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-4 shadow-sm max-w-xl mx-auto my-12">
          <h2 className="text-2xl font-bold text-slate-950">Activity not found</h2>
          <p className="text-slate-600">The activity you are trying to edit does not exist.</p>
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

  if (record.category !== 'Transportation') {
    return (
      <Layout>
        <div className="max-w-xl mx-auto bg-white p-8 rounded-lg border border-slate-200 shadow-sm space-y-4 text-center">
          <h2 className="text-xl font-bold text-slate-900">Editing Unavailable</h2>
          <p className="text-sm text-slate-600">
            This activity cannot currently be edited because a compatible calculator is not available.
          </p>
          <div className="pt-4">
            <Link
              to={`/activities/${record.id}`}
              className="inline-flex items-center justify-center bg-sky-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-sky-700"
            >
              Back
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (distanceKm < 0) {
      setError('Distance cannot be negative.');
      return;
    }
    try {
      const dataQuality: DataQuality = record.dataQuality || 'Medium';
      const result = CarbonCalculator.calculateTransportation(distanceKm, record.emissionFactorId || 'trans-car-petrol', dataQuality);

      const updatedRecord = {
        ...record,
        occurredAt: new Date(date).toISOString(),
        localDate: date,
        inputs: { distanceKm },
        normalizedInputs: { distanceKm },
        estimatedCO2e: result.value,
        emissionFactorId: result.activityId,
        emissionFactorVersion: result.factor.version,
        assumptions: result.assumptions,
        updatedAt: new Date().toISOString()
      };

      ActivityRepository.update(updatedRecord);
      navigate(`/activities/${record.id}`);
    } catch (err) {
      setError('Failed to recalculate and update activity.');
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <Link to={`/activities/${record.id}`} className="text-sm font-medium text-sky-600 hover:text-sky-700">
            &larr; Back to Activity Detail
          </Link>
          <h1 className="text-3xl font-bold text-slate-950 mt-2">Edit Activity</h1>
          <p className="text-sm text-slate-600">Update inputs to automatically recalculate estimated emissions.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Distance (km)</label>
            <input
              type="number"
              step="0.1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
              required
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm"
            />
          </div>
          <div className="pt-2 flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium shadow-sm"
            >
              Save Changes
            </button>
            <Link
              to={`/activities/${record.id}`}
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
