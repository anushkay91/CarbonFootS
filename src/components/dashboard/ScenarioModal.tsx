import React, { useState } from 'react';
import { Recommendation } from '../../services/RecommendationEngine';
import { ScenarioEngine, ScenarioResult } from '../../services/ScenarioEngine';
import { EMISSION_FACTORS } from '../../data/emissionFactors';
import { CarbonGoal, ActivityRecord } from '../../types/domain';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation?: Recommendation;
  activeGoal?: CarbonGoal;
  records: ActivityRecord[];
}

export function ScenarioModal({ isOpen, onClose, recommendation, activeGoal, records }: ScenarioModalProps) {
  if (!isOpen) return null;

  // Determine initial activity and values based on recommendation or goal or fallback
  let initialFactorId = 'trans-car-petrol';
  let initialCurrentVal = 100;
  let initialScenarioVal = 80;
  let initialUnit = 'km';
  let initialActivityType = 'Driving Car (Petrol)';

  if (recommendation && recommendation.evidence.activityType) {
    const matchedFactor = Object.values(EMISSION_FACTORS).find(f => f.activity === recommendation.evidence.activityType);
    if (matchedFactor) {
      initialFactorId = matchedFactor.id;
      initialActivityType = matchedFactor.activity;
      initialUnit = matchedFactor.category === 'Electricity' ? 'kWh' : 'km';
    }
    if (recommendation.evidence.currentValue) {
      initialCurrentVal = recommendation.evidence.currentValue;
    }
    if (recommendation.evidence.targetValue) {
      initialScenarioVal = recommendation.evidence.targetValue;
    } else {
      initialScenarioVal = Math.max(0, initialCurrentVal * 0.8);
    }
  } else if (activeGoal && activeGoal.linkedFactorId) {
    const matchedFactor = EMISSION_FACTORS[activeGoal.linkedFactorId];
    if (matchedFactor) {
      initialFactorId = matchedFactor.id;
      initialActivityType = matchedFactor.activity;
      initialUnit = matchedFactor.category === 'Electricity' ? 'kWh' : 'km';
    }
    initialCurrentVal = 100;
    initialScenarioVal = activeGoal.targetValue;
  }

  const [factorId, setFactorId] = useState(initialFactorId);
  const [currentValue, setCurrentValue] = useState(initialCurrentVal);
  const [scenarioValue, setScenarioValue] = useState(initialScenarioVal);

  const factor = EMISSION_FACTORS[factorId] || EMISSION_FACTORS['trans-car-petrol'];
  const unit = factor.category === 'Electricity' ? 'kWh' : 'km';

  let result: ScenarioResult | null = null;
  let errorMessage: string | null = null;

  try {
    result = ScenarioEngine.calculateScenario({
      activityType: factor.activity,
      factorId: factor.id,
      currentValue,
      scenarioValue,
      unit
    });
  } catch (err: any) {
    errorMessage = err.message || 'Invalid scenario parameters.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-6 overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">What-If Impact Simulator</h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore estimated emissions under a simulated activity level.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
          >
            &times;
          </button>
        </div>

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded text-xs">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Select Activity Type</label>
            <select
              value={factorId}
              onChange={(e) => {
                const fid = e.target.value;
                setFactorId(fid);
                const f = EMISSION_FACTORS[fid];
                if (f) {
                  setScenarioValue(f.category === 'Electricity' ? 150 : 80);
                }
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:border-sky-500 focus:ring-sky-500"
            >
              {Object.values(EMISSION_FACTORS).map(f => (
                <option key={f.id} value={f.id}>
                  {f.category} — {f.activity} ({f.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Current Baseline ({unit})</label>
              <input
                type="number"
                min="0"
                step="any"
                value={currentValue}
                onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Scenario Target ({unit})</label>
              <input
                type="number"
                min="0"
                step="any"
                value={scenarioValue}
                onChange={(e) => setScenarioValue(parseFloat(e.target.value) || 0)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
          </div>

          {result && (
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200/60 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Current Estimate</span>
                  <span className="text-base font-bold text-slate-900">{result.currentEstimatedCO2e}</span>
                  <span className="text-[10px] text-slate-400 block">kg CO₂e</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Scenario Estimate</span>
                  <span className="text-base font-bold text-sky-600">{result.scenarioEstimatedCO2e}</span>
                  <span className="text-[10px] text-slate-400 block">kg CO₂e</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Estimated Difference</span>
                  <span className={`text-base font-bold ${result.estimatedChange < 0 ? 'text-emerald-700' : result.estimatedChange > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                    {result.estimatedChange > 0 ? `+${result.estimatedChange}` : result.estimatedChange}
                  </span>
                  <span className="text-[10px] text-slate-400 block">kg CO₂e</span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                <span className="font-semibold block text-slate-700">Scenario Assumptions:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {result.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="bg-sky-600 text-white px-4 py-2 rounded-md text-xs font-medium hover:bg-sky-700 shadow-sm"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
}
