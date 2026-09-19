import { describe, it, expect } from 'vitest';
import { RecommendationEngine } from '../services/RecommendationEngine';
import { CarbonGoal, ActivityRecord } from '../types/domain';

const sampleGoal: CarbonGoal = {
  id: 'goal-1',
  actionId: 'activity-linked-reduction',
  title: 'Reduce Car Travel',
  metric: 'distance',
  targetValue: 30,
  unit: 'km',
  cadence: 'weekly',
  startDate: '2026-09-01',
  endDate: '2026-09-30',
  status: 'active',
  linkedCategory: 'Transportation',
  linkedActivityType: 'Driving Car (Petrol)',
  linkedFactorId: 'trans-car-petrol',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const sampleRecords: ActivityRecord[] = [
  {
    id: 'act-1',
    occurredAt: '2026-09-15T10:00:00.000Z',
    localDate: new Date().toISOString().split('T')[0],
    category: 'Transportation',
    activityType: 'Driving Car (Petrol)',
    inputs: { distanceKm: 50 },
    normalizedInputs: { distanceKm: 50 },
    estimatedCO2e: 7.5,
    unit: 'kg CO2e',
    emissionFactorId: 'trans-car-petrol',
    dataQuality: 'High',
    assumptions: [],
    source: 'manual',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'act-2',
    occurredAt: '2026-09-15T11:00:00.000Z',
    localDate: new Date().toISOString().split('T')[0],
    category: 'Transportation',
    activityType: 'Driving Car (Petrol)',
    inputs: { distanceKm: 30 },
    normalizedInputs: { distanceKm: 30 },
    estimatedCO2e: 4.5,
    unit: 'kg CO2e',
    emissionFactorId: 'trans-car-petrol',
    dataQuality: 'High',
    assumptions: [],
    source: 'manual',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

describe('RecommendationEngine (A6)', () => {
  it('generates no-data recommendation when records array is empty', () => {
    const rec = RecommendationEngine.getPrimaryRecommendation([], []);
    expect(rec.reasonCode).toBe('NO_DATA');
  });

  it('generates limited-data recommendation when record count is low', () => {
    const rec = RecommendationEngine.getPrimaryRecommendation([sampleRecords[0]], []);
    expect(rec.reasonCode).toBe('LIMITED_DATA');
  });

  it('prioritizes active goal gap when goal target is exceeded', () => {
    // Current is 80 km, target is 30 km (exceeded)
    const rec = RecommendationEngine.getPrimaryRecommendation(sampleRecords, [sampleGoal]);
    expect(rec.reasonCode).toBe('ACTIVE_GOAL_GAP');
    expect(rec.title).toContain('Reduce Driving Car (Petrol)');
    expect(rec.potentialReduction).toBeDefined();
  });

  it('falls back to largest reported hotspot when no active goal gap exists', () => {
    const rec = RecommendationEngine.getPrimaryRecommendation(sampleRecords, []);
    expect(rec.reasonCode).toBe('LARGEST_ACTIVITY_HOTSPOT');
    expect(rec.evidence.activityType).toBe('Driving Car (Petrol)');
  });
});
