import { describe, it, expect, beforeEach } from 'vitest';
import { ActivityRepository } from '../services/ActivityRepository';
import { GoalRepository } from '../services/GoalRepository';
import { CarbonCalculator } from '../services/carbonCalculator';
import { TrackingSummaryEngine } from '../services/TrackingSummaryEngine';
import { ActivityRecord, CarbonGoal, GoalCheckIn } from '../types/domain';

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

describe('Complete Integration Journey & Reliability', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('verifies the full activity creation -> calculation -> aggregation -> dashboard summary journey', () => {
    const today = new Date().toISOString().split('T')[0];
    const calcResult = CarbonCalculator.calculateTransportation(20, 'trans-car-petrol', 'Medium');

    const activity: ActivityRecord = {
      id: 'int-act-1',
      occurredAt: new Date().toISOString(),
      localDate: today,
      category: 'Transportation',
      activityType: 'Driving Car (Petrol)',
      inputs: { distanceKm: 20 },
      normalizedInputs: { distanceKm: 20 },
      estimatedCO2e: calcResult.value,
      unit: 'kg CO2e',
      emissionFactorId: calcResult.activityId,
      emissionFactorVersion: calcResult.factor.version,
      dataQuality: 'Medium',
      assumptions: calcResult.assumptions,
      source: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Save via repository
    ActivityRepository.save(activity);

    // 2. Read back from repository
    const storedActivities = ActivityRepository.getAll();
    expect(storedActivities.length).toBe(1);
    expect(storedActivities[0].estimatedCO2e).toBe(3.0); // 20 * 0.15

    // 3. Aggregate via TrackingSummaryEngine
    const summary = TrackingSummaryEngine.getSummary(storedActivities, today, today);
    expect(summary.totalCO2e).toBe(3.0);
    expect(summary.activityCount).toBe(1);
    expect(summary.categoryTotals['Transportation']).toBe(3.0);

    // 4. Edit activity and ensure recalculation propagates
    const updatedCalc = CarbonCalculator.calculateTransportation(40, 'trans-car-petrol', 'Medium');
    const updatedActivity: ActivityRecord = {
      ...storedActivities[0],
      inputs: { distanceKm: 40 },
      normalizedInputs: { distanceKm: 40 },
      estimatedCO2e: updatedCalc.value,
      updatedAt: new Date().toISOString()
    };

    ActivityRepository.update(updatedActivity);

    const reloadedActivities = ActivityRepository.getAll();
    expect(reloadedActivities[0].inputs.distanceKm).toBe(40);
    expect(reloadedActivities[0].estimatedCO2e).toBe(6.0); // 40 * 0.15

    const updatedSummary = TrackingSummaryEngine.getSummary(reloadedActivities, today, today);
    expect(updatedSummary.totalCO2e).toBe(6.0);
  });

  it('verifies goal creation -> check-in -> progress tracking -> persistence across reload', () => {
    const today = new Date().toISOString().split('T')[0];

    const goal: CarbonGoal = {
      id: 'int-goal-1',
      actionId: 'test-action',
      title: 'Carpool twice',
      metric: 'count',
      targetValue: 2,
      unit: 'times',
      cadence: 'weekly',
      startDate: today,
      endDate: today,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    GoalRepository.saveGoal(goal);

    const checkIn: GoalCheckIn = {
      id: 'int-ci-1',
      goalId: 'int-goal-1',
      date: today,
      value: 1,
      source: 'self-reported',
      createdAt: new Date().toISOString()
    };

    GoalRepository.saveCheckIn(checkIn);

    // Simulate reload / re-read from repository
    const goals = GoalRepository.getGoals();
    const checkIns = GoalRepository.getCheckIns('int-goal-1');

    expect(goals.length).toBe(1);
    expect(checkIns.length).toBe(1);
    expect(checkIns[0].value).toBe(1);

    const progress = checkIns.reduce((sum, c) => sum + c.value, 0);
    expect(progress).toBe(1);
  });

  it('verifies deletion consistency without affecting other records', () => {
    const today = new Date().toISOString().split('T')[0];

    const act1: ActivityRecord = {
      id: 'del-1',
      occurredAt: new Date().toISOString(),
      localDate: today,
      category: 'Transportation',
      activityType: 'Car',
      inputs: { distanceKm: 10 },
      normalizedInputs: { distanceKm: 10 },
      estimatedCO2e: 1.5,
      unit: 'kg CO2e',
      dataQuality: 'Medium',
      assumptions: [],
      source: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const act2: ActivityRecord = {
      id: 'del-2',
      occurredAt: new Date().toISOString(),
      localDate: today,
      category: 'Electricity',
      activityType: 'Grid',
      inputs: { kwh: 10 },
      normalizedInputs: { kwh: 10 },
      estimatedCO2e: 4.5,
      unit: 'kg CO2e',
      dataQuality: 'High',
      assumptions: [],
      source: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    ActivityRepository.save(act1);
    ActivityRepository.save(act2);

    expect(ActivityRepository.getAll().length).toBe(2);

    ActivityRepository.delete('del-1');

    const remaining = ActivityRepository.getAll();
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe('del-2');
  });
});
