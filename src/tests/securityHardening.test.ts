import { describe, it, expect, beforeEach } from 'vitest';
import { validateNumber, validateActivityRecord, validateCarbonGoal } from '../utils/validation';
import { StorageManager } from '../services/StorageManager';
import { ActivityRepository } from '../services/ActivityRepository';
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

describe('Security and Data Integrity Hardening', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('validates numbers correctly and rejects NaN, Infinity, and negative values', () => {
    expect(validateNumber(10, 'Test').error).toBeUndefined();
    expect(validateNumber(-5, 'Test', true).error).toBeDefined(); // negative allowed if allowZero=true? Wait, validateNumber allows negative if allowZero=true? Ah, let's check validateNumber:
    // if (allowZero && val < 0) return { value: 0, error: '...' } -> wait, allowZero means 0 is allowed. If val < 0, it errors!
    expect(validateNumber(-1, 'Test', false).error).toBeDefined();
    expect(validateNumber(NaN, 'Test').error).toBeDefined();
    expect(validateNumber(Infinity, 'Test').error).toBeDefined();
  });

  it('rejects malformed activity records during validation', () => {
    const invalidRecord = {
      id: '',
      category: 'InvalidCategory',
      activityType: '',
      estimatedCO2e: -10,
      localDate: 'not-a-date',
      inputs: null
    };

    const res = validateActivityRecord(invalidRecord);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it('handles corrupted JSON in LocalStorage safely without crashing', () => {
    localStorage.setItem('carbon_activity_records_v1', 'INVALID_JSON{{{');
    
    // Should safely catch parse error and return empty array
    const records = ActivityRepository.getAll();
    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBe(0);
  });

  it('loads versioned storage payload correctly and drops invalid items', () => {
    const validRecord: ActivityRecord = {
      id: 'act-1',
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

    const invalidItem = { id: 'bad', estimatedCO2e: -999 };

    const payload = {
      version: 1,
      data: [validRecord, invalidItem]
    };

    localStorage.setItem('test_key_v1', JSON.stringify(payload));

    const loaded = StorageManager.loadData<ActivityRecord>('test_key_v1', (item) => validateActivityRecord(item).valid);
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('act-1');
  });

  it('prevents saving invalid activity records via repository', () => {
    const badRecord = {
      id: '',
      category: 'Transportation',
      activityType: 'Car',
      estimatedCO2e: NaN,
      localDate: '2026-09-19',
      inputs: {}
    } as ActivityRecord;

    expect(() => ActivityRepository.save(badRecord)).toThrow();
  });
});
