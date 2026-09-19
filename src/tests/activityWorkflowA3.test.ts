import { describe, it, expect, beforeEach } from 'vitest';
import { CarbonCalculator } from '../services/carbonCalculator';
import { ActivityRepository } from '../services/ActivityRepository';
import { EMISSION_FACTORS } from '../data/emissionFactors';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

describe('A3 Category-Aware Activity Workflow & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('correctly resolves and calculates bus transport activity', () => {
    const factor = EMISSION_FACTORS['trans-bus-avg'];
    expect(factor).toBeDefined();

    const result = CarbonCalculator.calculateTransportation(40, 'trans-bus-avg', 'High');
    expect(result.value).toBe(40 * 0.08);
    expect(result.category).toBe('Transportation');
    expect(result.factor.id).toBe('trans-bus-avg');
  });

  it('correctly resolves and calculates electricity consumption activity', () => {
    const factor = EMISSION_FACTORS['elec-grid-avg'];
    expect(factor).toBeDefined();

    const result = CarbonCalculator.calculateElectricity(250, 'elec-grid-avg', 'Medium');
    expect(result.value).toBe(250 * 0.45);
    expect(result.category).toBe('Electricity');
    expect(result.factor.id).toBe('elec-grid-avg');
  });

  it('persists and retrieves multi-category records correctly', () => {
    const busRecord = {
      id: 'test-bus-1',
      occurredAt: new Date().toISOString(),
      localDate: '2026-09-19',
      category: 'Transportation' as const,
      activityType: 'Bus (Average Passenger)',
      inputs: { distanceKm: 30 },
      normalizedInputs: { distanceKm: 30 },
      estimatedCO2e: 30 * 0.08,
      unit: 'kg CO2e' as const,
      emissionFactorId: 'trans-bus-avg',
      emissionFactorVersion: '1.0.0',
      dataQuality: 'High' as const,
      assumptions: ['Standard passenger bus factor'],
      source: 'manual' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const elecRecord = {
      id: 'test-elec-1',
      occurredAt: new Date().toISOString(),
      localDate: '2026-09-19',
      category: 'Electricity' as const,
      activityType: 'Grid Electricity',
      inputs: { kwh: 120 },
      normalizedInputs: { kwh: 120 },
      estimatedCO2e: 120 * 0.45,
      unit: 'kg CO2e' as const,
      emissionFactorId: 'elec-grid-avg',
      emissionFactorVersion: '1.0.0',
      dataQuality: 'Medium' as const,
      assumptions: ['Standard grid factor'],
      source: 'manual' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    ActivityRepository.save(busRecord);
    ActivityRepository.save(elecRecord);

    const all = ActivityRepository.getAll();
    expect(all.length).toBe(2);

    const retrievedBus = all.find(r => r.id === 'test-bus-1');
    expect(retrievedBus?.activityType).toBe('Bus (Average Passenger)');
    expect(retrievedBus?.estimatedCO2e).toBe(2.4);

    const retrievedElec = all.find(r => r.id === 'test-elec-1');
    expect(retrievedElec?.category).toBe('Electricity');
    expect(retrievedElec?.estimatedCO2e).toBe(54);
  });
});
