import { EmissionFactor } from '../types/domain';

export const EMISSION_FACTORS: Record<string, EmissionFactor> = {
  'trans-car-petrol': {
    id: 'trans-car-petrol',
    category: 'Transportation',
    activity: 'Driving Car (Petrol)',
    value: 0.15,
    unit: 'kg CO2e/km',
    geographicScope: 'Global',
    source: 'Verified Govt Database',
    methodologyRef: 'IEA_2024',
    version: '1.0.0'
  },
  'elec-grid-avg': {
    id: 'elec-grid-avg',
    category: 'Electricity',
    activity: 'Grid Electricity',
    value: 0.45,
    unit: 'kg CO2e/kWh',
    geographicScope: 'Global',
    source: 'International Energy Agency',
    methodologyRef: 'IEA_2024',
    version: '1.0.0'
  }
};
