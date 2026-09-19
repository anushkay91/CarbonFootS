import { describe, it, expect } from 'vitest';
import { CarbonCalculator } from '../services/carbonCalculator';
import { EMISSION_FACTORS } from '../data/emissionFactors';

describe('CarbonCalculator', () => {
  it('calculates transportation emissions correctly', () => {
    const distanceKm = 10;
    const factorId = 'trans-car-petrol';
    const result = CarbonCalculator.calculateTransportation(distanceKm, factorId, 'High');
    
    // 10 * 0.15 = 1.5
    expect(result.value).toBe(1.5);
    expect(result.category).toBe('Transportation');
  });

  it('throws error for invalid transportation factor', () => {
    expect(() => 
      CarbonCalculator.calculateTransportation(10, 'invalid-factor', 'High')
    ).toThrow();
  });

  it('handles zero distance', () => {
    const result = CarbonCalculator.calculateTransportation(0, 'trans-car-petrol', 'High');
    expect(result.value).toBe(0);
  });

  it('handles negative distance by allowing it (though domain validation should catch it before)', () => {
    // The engine itself currently performs a simple multiplication.
    // Domain validation should happen at the service/input layer.
    const result = CarbonCalculator.calculateTransportation(-10, 'trans-car-petrol', 'High');
    expect(result.value).toBe(-1.5);
  });
});
