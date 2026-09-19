import React, { useState, useMemo } from 'react';
import { CarbonCalculator } from '../services/carbonCalculator';
import { ActivityRepository } from '../services/ActivityRepository';
import { EMISSION_FACTORS } from '../data/emissionFactors';
import { DataQuality } from '../types/domain';
import { useNavigate, Link } from 'react-router-dom';

export default function AddActivityForm() {
  const navigate = useNavigate();

  // Category and Factor selection state
  const [category, setCategory] = useState<'Transportation' | 'Electricity'>('Transportation');
  const [factorId, setFactorId] = useState<string>('trans-car-petrol');
  const [inputValue, setInputValue] = useState<number>(10);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  // Available options derived from canonical EMISSION_FACTORS
  const transportFactors = useMemo(() => {
    return Object.values(EMISSION_FACTORS).filter(f => f.category === 'Transportation');
  }, []);

  const electricityFactors = useMemo(() => {
    return Object.values(EMISSION_FACTORS).filter(f => f.category === 'Electricity');
  }, []);

  // Handle category change
  const handleCategoryChange = (newCat: 'Transportation' | 'Electricity') => {
    setCategory(newCat);
    if (newCat === 'Transportation') {
      setFactorId('trans-car-petrol');
    } else {
      setFactorId('elec-grid-avg');
    }
  };

  // Current selected factor
  const currentFactor = EMISSION_FACTORS[factorId];

  // Live preview calculation
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
      const dataQuality: DataQuality = 'Medium';
      let result;
      let inputs: Record<string, unknown>;

      if (category === 'Transportation') {
        result = CarbonCalculator.calculateTransportation(inputValue, factorId, dataQuality);
        inputs = { distanceKm: inputValue };
      } else {
        result = CarbonCalculator.calculateElectricity(inputValue, factorId, dataQuality);
        inputs = { kwh: inputValue };
      }

      ActivityRepository.save({
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
        occurredAt: new Date(date).toISOString(),
        localDate: date,
        category,
        activityType: currentFactor.activity,
        inputs,
        normalizedInputs: inputs,
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
      setError('Failed to calculate and save emissions.');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Link to="/activities" className="text-sm font-medium text-sky-600 hover:text-sky-700">
          &larr; Back to Activities
        </Link>
        <h1 className="text-3xl font-bold text-slate-950 mt-2">Log New Activity</h1>
        <p className="text-sm text-slate-600">Select your category, activity type, and consumption to calculate carbon impact.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-5">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm font-medium">{error}</div>}

        {/* Date */}
        <div>
          <label htmlFor="activity-date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            id="activity-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:border-sky-500 focus:ring-sky-500"
          />
        </div>

        {/* Category Selection */}
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

        {/* Activity Type Selection */}
        <div>
          <label htmlFor="activity-type" className="block text-sm font-medium text-slate-700 mb-1">Activity Type</label>
          <select
            id="activity-type"
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

        {/* Dynamic Input (Distance or kWh) */}
        <div>
          <label htmlFor="activity-input" className="block text-sm font-medium text-slate-700 mb-1">
            {category === 'Transportation' ? 'Distance' : 'Electricity Consumption'}
          </label>
          <div className="relative rounded-md shadow-sm">
            <input
              id="activity-input"
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

        {/* Calculation Preview Box */}
        {previewResult && (
          <div className="bg-sky-50 border border-sky-200 rounded-md p-4 space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800">Estimated Impact</span>
              <span className="text-xs text-sky-600 font-medium">Source: {previewResult.factor.source.split('/')[0]}</span>
            </div>
            <p className="text-2xl font-extrabold text-sky-900">
              {previewResult.value.toFixed(2)} <span className="text-sm font-normal text-sky-700">kg CO₂e</span>
            </p>
          </div>
        )}

        {/* Unsupported Categories Notice */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Note: Food, Waste, and Shopping categories are structurally available but calculation-unsupported due to lack of defensible scientific factor datasets.
          </p>
        </div>

        <div className="pt-2 flex space-x-3">
          <button
            type="submit"
            className="flex-1 bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium shadow-sm"
          >
            Log Activity
          </button>
          <Link
            to="/activities"
            className="bg-white text-slate-700 border border-slate-300 py-2 px-4 rounded-md hover:bg-slate-50 text-sm font-medium text-center shadow-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
