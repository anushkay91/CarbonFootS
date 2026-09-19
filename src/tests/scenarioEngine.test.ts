import { describe, it, expect } from 'vitest';
import { ScenarioEngine } from '../services/ScenarioEngine';

describe('ScenarioEngine (A7)', () => {
  it('calculates scenario reduction correctly with same factor', () => {
    const res = ScenarioEngine.calculateScenario({
      activityType: 'Driving Car (Petrol)',
      factorId: 'trans-car-petrol',
      currentValue: 100,
      scenarioValue: 80,
      unit: 'km'
    });

    expect(res.currentEstimatedCO2e).toBe(15.0); // 100 * 0.15
    expect(res.scenarioEstimatedCO2e).toBe(12.0); // 80 * 0.15
    expect(res.estimatedChange).toBe(-3.0);
    expect(res.direction).toBe('decrease');
    expect(res.percentageChange).toBe(-20.0);
  });

  it('calculates scenario increase correctly', () => {
    const res = ScenarioEngine.calculateScenario({
      activityType: 'Grid Electricity',
      factorId: 'elec-grid-avg',
      currentValue: 100,
      scenarioValue: 150,
      unit: 'kWh'
    });

    expect(res.currentEstimatedCO2e).toBe(45.0); // 100 * 0.45
    expect(res.scenarioEstimatedCO2e).toBe(67.5); // 150 * 0.45
    expect(res.estimatedChange).toBe(22.5);
    expect(res.direction).toBe('increase');
    expect(res.percentageChange).toBe(50.0);
  });

  it('handles stable scenarios correctly', () => {
    const res = ScenarioEngine.calculateScenario({
      activityType: 'Train (National Rail)',
      factorId: 'trans-train-avg',
      currentValue: 50,
      scenarioValue: 50,
      unit: 'km'
    });

    expect(res.estimatedChange).toBe(0);
    expect(res.direction).toBe('stable');
  });

  it('rejects negative or invalid scenario inputs', () => {
    expect(() => {
      ScenarioEngine.calculateScenario({
        activityType: 'Driving Car (Petrol)',
        factorId: 'trans-car-petrol',
        currentValue: -10,
        scenarioValue: 80,
        unit: 'km'
      });
    }).toThrow();
  });
});
