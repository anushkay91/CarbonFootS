import { describe, it, expect, beforeEach } from 'vitest';
import { ActivityRepository } from '../services/ActivityRepository';
import { CarbonCalculator } from '../services/carbonCalculator';
import { ActivityRecord } from '../types/domain';

// Mock localStorage for test environment
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

describe('Activity CRUD and Repository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and retrieves activity records correctly', () => {
    const record: ActivityRecord = {
      id: 'test-1',
      occurredAt: '2026-09-19T10:00:00.000Z',
      localDate: '2026-09-19',
      category: 'Transportation',
      activityType: 'Driving Car (Petrol)',
      inputs: { distanceKm: 15 },
      normalizedInputs: { distanceKm: 15 },
      estimatedCO2e: 2.25,
      unit: 'kg CO2e',
      emissionFactorId: 'trans-car-petrol',
      emissionFactorVersion: '1.0.0',
      dataQuality: 'Medium',
      assumptions: [],
      source: 'manual',
      createdAt: '2026-09-19T10:00:00.000Z',
      updatedAt: '2026-09-19T10:00:00.000Z'
    };

    ActivityRepository.save(record);
    const all = ActivityRepository.getAll();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe('test-1');
    expect(all[0].estimatedCO2e).toBe(2.25);
  });

  it('updates an existing record and recalculates emissions', () => {
    const record: ActivityRecord = {
      id: 'test-2',
      occurredAt: '2026-09-19T10:00:00.000Z',
      localDate: '2026-09-19',
      category: 'Transportation',
      activityType: 'Driving Car (Petrol)',
      inputs: { distanceKm: 10 },
      normalizedInputs: { distanceKm: 10 },
      estimatedCO2e: 1.5,
      unit: 'kg CO2e',
      emissionFactorId: 'trans-car-petrol',
      emissionFactorVersion: '1.0.0',
      dataQuality: 'Medium',
      assumptions: [],
      source: 'manual',
      createdAt: '2026-09-19T10:00:00.000Z',
      updatedAt: '2026-09-19T10:00:00.000Z'
    };

    ActivityRepository.save(record);

    // Simulate edit with distance 30 km
    const newDistance = 30;
    const calcResult = CarbonCalculator.calculateTransportation(newDistance, 'trans-car-petrol', 'Medium');

    const updated: ActivityRecord = {
      ...record,
      inputs: { distanceKm: newDistance },
      normalizedInputs: { distanceKm: newDistance },
      estimatedCO2e: calcResult.value,
      updatedAt: new Date().toISOString()
    };

    ActivityRepository.update(updated);

    const all = ActivityRepository.getAll();
    expect(all.length).toBe(1);
    expect(all[0].inputs.distanceKm).toBe(30);
    expect(all[0].estimatedCO2e).toBe(4.5); // 30 * 0.15
  });

  it('deletes a record by immutable ID', () => {
    const record: ActivityRecord = {
      id: 'test-3',
      occurredAt: '2026-09-19T10:00:00.000Z',
      localDate: '2026-09-19',
      category: 'Electricity',
      activityType: 'Grid Electricity',
      inputs: { kwh: 10 },
      normalizedInputs: { kwh: 10 },
      estimatedCO2e: 4.5,
      unit: 'kg CO2e',
      dataQuality: 'High',
      assumptions: [],
      source: 'manual',
      createdAt: '2026-09-19T10:00:00.000Z',
      updatedAt: '2026-09-19T10:00:00.000Z'
    };

    ActivityRepository.save(record);
    expect(ActivityRepository.getAll().length).toBe(1);

    ActivityRepository.delete('test-3');
    expect(ActivityRepository.getAll().length).toBe(0);
  });
});
