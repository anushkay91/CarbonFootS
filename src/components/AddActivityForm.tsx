import React, { useState } from 'react';
import { CarbonCalculator } from '../services/carbonCalculator';
import { ActivityRepository } from '../services/ActivityRepository';
import { DataQuality } from '../types/domain';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export default function AddActivityForm() {
  const navigate = useNavigate();
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (distanceKm < 0) {
      setError('Distance cannot be negative.');
      return;
    }
    try {
      const dataQuality: DataQuality = 'Medium';
      const result = CarbonCalculator.calculateTransportation(distanceKm, 'trans-car-petrol', dataQuality);

      ActivityRepository.save({
        id: uuidv4(),
        occurredAt: new Date(date).toISOString(),
        localDate: date,
        category: 'Transportation',
        activityType: 'Driving Car (Petrol)',
        inputs: { distanceKm },
        normalizedInputs: { distanceKm },
        estimatedCO2e: result.value,
        unit: 'kg CO2e',
        emissionFactorId: result.activityId,
        emissionFactorVersion: result.factor.version,
        dataQuality,
        assumptions: result.assumptions,
        source: 'manual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      navigate('/activities');
    } catch (err) {
      setError('Failed to calculate emissions.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
      {error && <p className="text-red-600">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-slate-700">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Distance (km)</label>
        <input type="number" step="0.1" value={distanceKm} onChange={(e) => setDistanceKm(parseFloat(e.target.value))} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" />
      </div>
      <button type="submit" className="w-full bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
        Log Activity
      </button>
    </form>
  );
}
