import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { ActivityRepository } from '../services/ActivityRepository';
import { CarbonCalculator } from '../services/carbonCalculator';
import { EMISSION_FACTORS } from '../data/emissionFactors';
import { DataQuality } from '../types/domain';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function EditActivityPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const records = useMemo(() => ActivityRepository.getAll(), []);
  const record = records.find(r => r.id === id);

  const initialCategory = record ? record.category : 'Transportation';
  const initialFactorId = record && record.emissionFactorId ? record.emissionFactorId : 'trans-car-petrol';
  const initialInputValue = record && record.inputs ? (Number(record.inputs.distanceKm) || Number(record.inputs.kwh) || 0) : 0;
  const initialDate = record ? record.localDate : new Date().toISOString().split('T')[0];

  const [category, setCategory] = useState<'Transportation' | 'Electricity'>(initialCategory === 'Electricity' ? 'Electricity' : 'Transportation');
  const [factorId, setFactorId] = useState<string>(initialFactorId);
  const [inputValue, setInputValue] = useState<number>(initialInputValue);
  const [date, setDate] = useState<string>(initialDate);
  const [error, setError] = useState<string | null>(null);

  const transportFactors = useMemo(() => Object.values(EMISSION_FACTORS).filter(f => f.category === 'Transportation'), []);
  const electricityFactors = useMemo(() => Object.values(EMISSION_FACTORS).filter(f => f.category === 'Electricity'), []);

  const handleCategoryChange = (newCat: 'Transportation' | 'Electricity') => {
    setCategory(newCat);
    if (newCat === 'Transportation') {
      setFactorId('trans-car-petrol');
    } else {
      setFactorId('elec-grid-avg');
    }
  };

  const currentFactor = EMISSION_FACTORS[factorId];

  const previewResult = useMemo(() => {
    try {
      if (inputValue < 0) return null;
      const dataQuality: DataQuality = 'Medium';
      if (category === 'Transportation') {
        return CarbonCalculator.calculateTransportation(inputValue, factorId, dataQuality);
      } else {
        return CarbonCalculator.calculateElectricity(inputValue, factorId, dataQuality);
      }
    } catch {
      return null;
    }
  }, [category, factorId, inputValue]);

  if (!record) {
    return (
      <Layout>
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-4 shadow-sm max-w-xl mx-auto my-12">
          <h2 className="text-2xl font-bold text-slate-950">Activity not found</h2>
          <p className="text-slate-600">The activity you are trying to edit does not exist.</p>
          <div className="pt-2">
            <Link
              to="/activities"
              className="inline-flex items-center justify-center bg-sky-600 text-white font-medium py-2.5 px-6 rounded-md hover:bg-sky-700 transition-colors shadow-sm"
            >
              Back to Activities
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue < 0) {
      setError('Input value cannot be negative.');
      return;
    }
    if (!currentFactor) {
      setError('Please select a valid activity type.');
      return;
    }

    try {
      const dataQuality: DataQuality = record.dataQuality || 'Medium';
      let result;
      let inputs: Record<string, unknown>;

      if (category === 'Transportation') {
        result = CarbonCalculator.calculateTransportation(inputValue, factorId, dataQuality);
        inputs = { distanceKm: inputValue };
      } else {
        result = CarbonCalculator.calculateElectricity(inputValue, factorId, dataQuality);
        inputs = { kwh: inputValue };
      }

      const updatedRecord = {
        ...record,
        occurredAt: new Date(date).toISOString(),
        localDate: date,
        category,
        activityType: currentFactor.activity,
        inputs,
        normalizedInputs: inputs,
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
          <p className="text-sm text-slate-600">Update inputs or category to automatically recalculate estimated emissions.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm font-medium">{error}</div>}

          <div>
            <label htmlFor="edit-date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:border-sky-500 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleCategoryChange('Transportation')}
                className={`py-2.5 px-4 rounded-md border text-sm font-medium text-center transition-colors ${
                  category === 'Transportation'
                    ? 'border-sky-600 bg-sky-50 text-sky-900 ring-1 ring-sky-600'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Transportation
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('Electricity')}
                className={`py-2.5 px-4 rounded-md border text-sm font-medium text-center transition-colors ${
                  category === 'Electricity'
                    ? 'border-sky-600 bg-sky-50 text-sky-900 ring-1 ring-sky-600'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Electricity
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="edit-activity-type" className="block text-sm font-medium text-slate-700 mb-1">Activity Type</label>
            <select
              id="edit-activity-type"
              value={factorId}
              onChange={(e) => setFactorId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:border-sky-500 focus:ring-sky-500"
            >
              {category === 'Transportation' ? (
                transportFactors.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.activity} ({f.value} {f.unit})
                  </option>
                ))
              ) : (
                electricityFactors.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.activity} ({f.value} {f.unit})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label htmlFor="edit-activity-input" className="block text-sm font-medium text-slate-700 mb-1">
              {category === 'Transportation' ? 'Distance' : 'Electricity Consumption'}
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                id="edit-activity-input"
                type="number"
                step="any"
                min="0"
                value={inputValue}
                onChange={(e) => setInputValue(parseFloat(e.target.value))}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 pr-16 text-sm bg-white focus:border-sky-500 focus:ring-sky-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-sm text-slate-500 font-medium">
                {category === 'Transportation' ? 'km' : 'kWh'}
              </div>
            </div>
          </div>

          {previewResult && (
            <div className="bg-sky-50 border border-sky-200 rounded-md p-4 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800">Recalculated Impact</span>
              <p className="text-2xl font-extrabold text-sky-900">
                {previewResult.value.toFixed(2)} <span className="text-sm font-normal text-sky-700">kg CO₂e</span>
              </p>
            </div>
          )}

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
