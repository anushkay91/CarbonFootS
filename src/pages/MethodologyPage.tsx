import React from 'react';
import Layout from '../components/Layout';
import { EMISSION_FACTORS } from '../data/emissionFactors';

export default function MethodologyPage() {
  const factors = Object.values(EMISSION_FACTORS);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-sky-50/60 via-white to-slate-50/50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Transparent Science</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Calculation Methodology & Transparency</h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            Understand how carbon emissions are estimated, the versioned emission factors used, and the underlying data assumptions.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">1. What is Estimated?</h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            The application estimates carbon dioxide equivalent (CO₂e) emissions from user-reported activities across supported categories such as Transportation and Electricity. All results are scientific estimates based on reported activity data and standardized emission factors.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">2. Core Calculation Formula</h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            Every calculation follows a strict deterministic formula:
          </p>
          <div className="bg-slate-50 p-4 rounded-md font-mono text-xs text-slate-800 border border-slate-200">
            Estimated CO₂e = User Input Quantity × Emission Factor Value
          </div>
          <p className="text-slate-700 text-sm leading-relaxed">
            For example, driving a petrol car: <code>Distance (km) × Factor (kg CO₂e/km) = Total kg CO₂e</code>.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">3. Active Emission Factors Dataset</h2>
          <p className="text-slate-700 text-sm text-slate-600">
            The application uses the following versioned emission factors as the canonical source for all calculations:
          </p>

          <div className="space-y-4">
            {factors.map(factor => (
              <div key={factor.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{factor.activity}</span>
                  <span className="text-xs font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                    {factor.category}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
                  <div>
                    <span className="font-medium text-slate-500 block">Factor Value:</span>
                    <span className="font-semibold text-slate-800">{factor.value} {factor.unit}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500 block">Factor ID:</span>
                    <span className="font-mono text-slate-800">{factor.id}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500 block">Version:</span>
                    <span className="text-slate-800">{factor.version}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500 block">Source:</span>
                    <span className="text-slate-800">{factor.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">4. Estimation & Data Quality</h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            Results are estimates and may vary depending on individual vehicle efficiency, grid energy mix, and user reporting accuracy. Data quality indicators (High, Medium, Low) reflect whether inputs are based on direct bills, measured devices, or standard category averages.
          </p>
        </div>
      </div>
    </Layout>
  );
}
