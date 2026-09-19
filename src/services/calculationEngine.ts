import { CalculationResult, DataQuality, Activity } from '../types/domain';
import { EMISSION_FACTORS } from '../data/emissionFactors';

export class CarbonCalculationEngine {
  static calculate(
    activityId: string,
    factorId: string,
    quantity: number,
    dataQuality: DataQuality,
    assumptions: string[] = []
  ): CalculationResult {
    const factor = EMISSION_FACTORS[factorId];
    if (!factor) {
      throw new Error(`Emission factor ${factorId} not found`);
    }

    // Deterministic calculation
    const value = quantity * factor.value;

    return {
      value,
      unit: 'kg CO2e',
      category: factor.category,
      activityId: activityId,
      factor: factor,
      assumptions,
      dataQuality
    };
  }
}
