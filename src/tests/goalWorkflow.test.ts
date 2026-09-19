import { describe, it, expect, beforeEach } from 'vitest';
import { GoalRepository } from '../services/GoalRepository';
import { CarbonGoal, GoalCheckIn } from '../types/domain';

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

describe('Goal Workflow and Repository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and retrieves goals correctly', () => {
    const goal: CarbonGoal = {
      id: 'goal-1',
      actionId: 'test-action',
      title: 'Carpool twice',
      metric: 'count',
      targetValue: 2,
      unit: 'times',
      cadence: 'weekly',
      startDate: '2026-09-01',
      endDate: '2026-09-07',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    GoalRepository.saveGoal(goal);
    const goals = GoalRepository.getGoals();
    expect(goals.length).toBe(1);
    expect(goals[0].title).toBe('Carpool twice');
    expect(goals[0].targetValue).toBe(2);
  });

  it('records check-ins and updates derived progress', () => {
    const goal: CarbonGoal = {
      id: 'goal-2',
      actionId: 'test-action',
      title: 'Use public transport',
      metric: 'count',
      targetValue: 3,
      unit: 'times',
      cadence: 'weekly',
      startDate: '2026-09-01',
      endDate: '2026-09-07',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    GoalRepository.saveGoal(goal);

    const checkIn: GoalCheckIn = {
      id: 'ci-1',
      goalId: 'goal-2',
      date: '2026-09-02',
      value: 1,
      source: 'self-reported',
      createdAt: new Date().toISOString()
    };

    GoalRepository.saveCheckIn(checkIn);

    const checkIns = GoalRepository.getCheckIns('goal-2');
    expect(checkIns.length).toBe(1);
    
    const progress = checkIns.reduce((sum, c) => sum + c.value, 0);
    expect(progress).toBe(1);
  });

  it('marks goal as completed when target is reached', () => {
    const goal: CarbonGoal = {
      id: 'goal-3',
      actionId: 'test-action',
      title: 'Meatless meal',
      metric: 'count',
      targetValue: 1,
      unit: 'times',
      cadence: 'weekly',
      startDate: '2026-09-01',
      endDate: '2026-09-07',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    GoalRepository.saveGoal(goal);

    GoalRepository.saveCheckIn({
      id: 'ci-2',
      goalId: 'goal-3',
      date: '2026-09-03',
      value: 1,
      source: 'self-reported',
      createdAt: new Date().toISOString()
    });

    const checkIns = GoalRepository.getCheckIns('goal-3');
    const progress = checkIns.reduce((sum, c) => sum + c.value, 0);

    if (progress >= goal.targetValue) {
      GoalRepository.updateGoal({
        ...goal,
        status: 'completed',
        updatedAt: new Date().toISOString()
      });
    }

    const updatedGoals = GoalRepository.getGoals();
    expect(updatedGoals[0].status).toBe('completed');
  });

  it('deletes a goal and its associated check-ins', () => {
    const goal: CarbonGoal = {
      id: 'goal-4',
      actionId: 'test-action',
      title: 'Reduce electricity',
      metric: 'count',
      targetValue: 2,
      unit: 'times',
      cadence: 'weekly',
      startDate: '2026-09-01',
      endDate: '2026-09-07',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    GoalRepository.saveGoal(goal);
    GoalRepository.saveCheckIn({
      id: 'ci-3',
      goalId: 'goal-4',
      date: '2026-09-04',
      value: 1,
      source: 'self-reported',
      createdAt: new Date().toISOString()
    });

    expect(GoalRepository.getGoals().length).toBe(1);
    expect(GoalRepository.getCheckIns('goal-4').length).toBe(1);

    GoalRepository.deleteGoal('goal-4');

    expect(GoalRepository.getGoals().length).toBe(0);
    expect(GoalRepository.getCheckIns('goal-4').length).toBe(0);
  });
});
