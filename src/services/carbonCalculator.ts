import { CalculationResult, DataQuality } from '../types/domain';
import { EMISSION_FACTORS } from '../data/emissionFactors';

/**
 * Deterministic Carbon Calculation Service
 * 
 * Provides structured calculations based on versioned emission factors.
 * Ensures strict separation between raw input, emission factors, and calculated results.
 */
export const CarbonCalculator = {
  
  calculateTransportation: (
    distanceKm: number,
    factorId: string,
    dataQuality: DataQuality
  ): CalculationResult => {
    const factor = EMISSION_FACTORS[factorId];
    if (!factor || factor.category !== 'Transportation') {
      throw new Error(`Invalid or missing transportation emission factor: ${factorId}`);
    }

    const value = distanceKm * factor.value;

    return {
      value,
      unit: 'kg CO2e',
      category: 'Transportation',
      activityId: factor.id,
      factor,
      assumptions: ['Calculated based on user-provided distance and category-level factor.'],
      dataQuality
    };
  },

  calculateElectricity: (
    kwh: number,
    factorId: string,
    dataQuality: DataQuality
  ): CalculationResult => {
    const factor = EMISSION_FACTORS[factorId];
    if (!factor || factor.category !== 'Electricity') {
      throw new Error(`Invalid or missing electricity emission factor: ${factorId}`);
    }

    const value = kwh * factor.value;

    return {
      value,
      unit: 'kg CO2e',
      category: 'Electricity',
      activityId: factor.id,
      factor,
      assumptions: ['Calculated based on provided kWh and grid average factor.'],
      dataQuality
    };
  },

  calculateFood: (
    frequencyPerMonth: number,
    factorId: string,
    dataQuality: DataQuality
  ): CalculationResult => {
    // For food, we assume frequency maps to quantity of servings per month
    // Food emission factors would need to be kg CO2e per serving.
    const factor = EMISSION_FACTORS[factorId];
    if (!factor || factor.category !== 'Food') {
      throw new Error(`Invalid or missing food emission factor: ${factorId}`);
    }

    const value = frequencyPerMonth * factor.value;

    return {
      value,
      unit: 'kg CO2e',
      category: 'Food',
      activityId: factor.id,
      factor,
      assumptions: ['Calculated based on estimated monthly frequency and category-level factor per serving.'],
      dataQuality
    };
  }
};
