import { CarbonCalculator } from './carbonCalculator';
import { EMISSION_FACTORS } from '../data/emissionFactors';

export interface ScenarioInput {
  activityType: string;
  factorId: string;
  currentValue: number;
  scenarioValue: number;
  unit: string;
}

export interface ScenarioResult {
  activityType: string;
  currentValue: number;
  scenarioValue: number;
  unit: string;
  currentEstimatedCO2e: number;
  scenarioEstimatedCO2e: number;
  estimatedChange: number; // scenarioCO2e - currentCO2e (negative is reduction)
  direction: 'decrease' | 'increase' | 'stable';
  percentageChange: number | null;
  assumptions: string[];
}

export class ScenarioEngine {
  static calculateScenario(input: ScenarioInput): ScenarioResult {
    const factor = EMISSION_FACTORS[input.factorId];
    if (!factor) {
      throw new Error(`Invalid emission factor ID for scenario: ${input.factorId}`);
    }

    if (input.currentValue < 0 || input.scenarioValue < 0 || Number.isNaN(input.currentValue) || Number.isNaN(input.scenarioValue)) {
      throw new Error('Scenario values must be valid non-negative numbers.');
    }

    let currentRes;
    let scenarioRes;

    if (factor.category === 'Transportation') {
      currentRes = CarbonCalculator.calculateTransportation(input.currentValue, factor.id, 'High');
      scenarioRes = CarbonCalculator.calculateTransportation(input.scenarioValue, factor.id, 'High');
    } else if (factor.category === 'Electricity') {
      currentRes = CarbonCalculator.calculateElectricity(input.currentValue, factor.id, 'High');
      scenarioRes = CarbonCalculator.calculateElectricity(input.scenarioValue, factor.id, 'High');
    } else {
      // Generic fallback for any other factor
      const curVal = input.currentValue * factor.value;
      const sceVal = input.scenarioValue * factor.value;
      currentRes = { value: curVal, unit: 'kg CO2e' as const, category: factor.category, activityId: factor.id, factor, assumptions: [], dataQuality: 'High' as const };
      scenarioRes = { value: sceVal, unit: 'kg CO2e' as const, category: factor.category, activityId: factor.id, factor, assumptions: [], dataQuality: 'High' as const };
    }

    const currentEstimatedCO2e = Number(currentRes.value.toFixed(2));
    const scenarioEstimatedCO2e = Number(scenarioRes.value.toFixed(2));
    const estimatedChange = Number((scenarioEstimatedCO2e - currentEstimatedCO2e).toFixed(2));

    let direction: 'decrease' | 'increase' | 'stable' = 'stable';
    if (estimatedChange < -0.01) direction = 'decrease';
    else if (estimatedChange > 0.01) direction = 'increase';

    let percentageChange: number | null = null;
    if (input.currentValue > 0) {
      percentageChange = Number((((input.scenarioValue - input.currentValue) / input.currentValue) * 100).toFixed(1));
    }

    const assumptions = [
      `Uses the same emission factor (${factor.value} ${factor.unit}) and calculation method as your recorded activity.`,
      'Scenario changes only the selected activity quantity. Other activities are held constant.'
    ];

    return {
      activityType: input.activityType,
      currentValue: input.currentValue,
      scenarioValue: input.scenarioValue,
      unit: input.unit,
      currentEstimatedCO2e,
      scenarioEstimatedCO2e,
      estimatedChange,
      direction,
      percentageChange,
      assumptions
    };
  }
}
