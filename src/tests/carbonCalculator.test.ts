import { describe, it, expect } from 'vitest';
import { CarbonCalculator } from '../services/carbonCalculator';

describe('CarbonCalculator', () => {
  it('calculates transportation emissions correctly (Car)', () => {
    const distanceKm = 10;
    const factorId = 'trans-car-petrol';
    const result = CarbonCalculator.calculateTransportation(distanceKm, factorId, 'High');
    
    // 10 * 0.15 = 1.5
    expect(result.value).toBe(1.5);
    expect(result.category).toBe('Transportation');
    expect(result.factor.source).toContain('UK Government GHG Conversion Factors');
  });

  it('calculates transportation emissions correctly (Bus, Train, Motorcycle)', () => {
    const busResult = CarbonCalculator.calculateTransportation(20, 'trans-bus-avg', 'Medium');
    expect(busResult.value).toBe(20 * 0.08);

    const trainResult = CarbonCalculator.calculateTransportation(50, 'trans-train-avg', 'High');
    expect(trainResult.value).toBe(50 * 0.04);

    const motoResult = CarbonCalculator.calculateTransportation(15, 'trans-motorcycle-avg', 'Medium');
    expect(motoResult.value).toBe(15 * 0.11);
  });

  it('calculates electricity emissions correctly', () => {
    const elecResult = CarbonCalculator.calculateElectricity(100, 'elec-grid-avg', 'High');
    expect(elecResult.value).toBe(100 * 0.45);
    expect(elecResult.category).toBe('Electricity');
  });

  it('throws error for invalid transportation factor', () => {
    expect(() => 
      CarbonCalculator.calculateTransportation(10, 'invalid-factor', 'High')
    ).toThrow();
  });

  it('prevents cross-category factor misuse', () => {
    expect(() =>
      CarbonCalculator.calculateTransportation(10, 'elec-grid-avg', 'High')
    ).toThrow();
  });

  it('handles zero distance', () => {
    const result = CarbonCalculator.calculateTransportation(0, 'trans-car-petrol', 'High');
    expect(result.value).toBe(0);
  });

  it('handles negative distance', () => {
    const result = CarbonCalculator.calculateTransportation(-10, 'trans-car-petrol', 'High');
    expect(result.value).toBe(-1.5);
  });
});
