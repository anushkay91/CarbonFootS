import { describe, it, expect } from 'vitest';
import { GoalAnalyticsEngine } from '../services/GoalAnalyticsEngine';
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
    localDate: new Date().toISOString().split('T')[0], // today
    category: 'Transportation',
    activityType: 'Driving Car (Petrol)',
    inputs: { distanceKm: 20 },
    normalizedInputs: { distanceKm: 20 },
    estimatedCO2e: 3.0,
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
    occurredAt: '2026-09-15T12:00:00.000Z',
    localDate: new Date().toISOString().split('T')[0], // today
    category: 'Electricity',
    activityType: 'Grid Electricity',
    inputs: { kwh: 50 },
    normalizedInputs: { kwh: 50 },
    estimatedCO2e: 22.5,
    unit: 'kg CO2e',
    emissionFactorId: 'elec-grid-avg',
    dataQuality: 'High',
    assumptions: [],
    source: 'manual',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

describe('GoalAnalyticsEngine (A5)', () => {
  it('analyzes goal progress and matches only linked activity types', () => {
    const analysis = GoalAnalyticsEngine.analyzeGoalProgress(sampleGoal, sampleRecords);
    expect(analysis.isActivityLinked).toBe(true);
    // Should match only the car record (20 km), ignoring electricity
    expect(analysis.currentValue).toBe(20);
    expect(analysis.currentCO2e).toBe(3.0);
    expect(analysis.isAchieved).toBe(true); // 20 <= 30 target limit
  });

  it('detects increase when current exceeds baseline or target limit', () => {
    const highRecords: ActivityRecord[] = [
      {
        ...sampleRecords[0],
        inputs: { distanceKm: 80 },
        normalizedInputs: { distanceKm: 80 },
        estimatedCO2e: 12.0
      }
    ];
    const analysis = GoalAnalyticsEngine.analyzeGoalProgress(sampleGoal, highRecords);
    expect(analysis.currentValue).toBe(80);
    expect(analysis.isAchieved).toBe(false); // 80 > 30 target limit
  });
});
