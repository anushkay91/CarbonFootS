import { describe, it, expect } from 'vitest';
import { CarbonCalculator } from '../services/carbonCalculator';
import { EMISSION_FACTORS } from '../data/emissionFactors';

describe('Carbon Factor Transparency & Methodology', () => {
  it('uses canonical emission factors and exposes version, source, and assumptions', () => {
    const result = CarbonCalculator.calculateTransportation(50, 'trans-car-petrol', 'High');

    expect(result.factor).toBeDefined();
    expect(result.factor.id).toBe('trans-car-petrol');
    expect(result.factor.version).toBe('1.0.0');
    expect(result.factor.source).toBe('UK Government GHG Conversion Factors for Company Reporting 2024');
    expect(result.value).toBe(50 * EMISSION_FACTORS['trans-car-petrol'].value);
    expect(result.assumptions.length).toBeGreaterThan(0);
    expect(result.dataQuality).toBe('High');
  });

  it('handles electricity calculations transparently with factor reference', () => {
    const result = CarbonCalculator.calculateElectricity(100, 'elec-grid-avg', 'Medium');

    expect(result.factor.id).toBe('elec-grid-avg');
    expect(result.factor.value).toBe(0.45);
    expect(result.value).toBe(45);
    expect(result.unit).toBe('kg CO2e');
  });
});
