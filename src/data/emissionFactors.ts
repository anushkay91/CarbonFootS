import { EmissionFactor } from '../types/domain';

export const EMISSION_FACTORS: Record<string, EmissionFactor> = {
  'trans-car-petrol': {
    id: 'trans-car-petrol',
    category: 'Transportation',
    activity: 'Driving Car (Petrol)',
    value: 0.15,
    unit: 'kg CO2e/km',
    geographicScope: 'Global / UK Average',
    source: 'UK Government GHG Conversion Factors for Company Reporting 2024',
    methodologyRef: 'DEFRA_2024_CAR',
    version: '1.0.0'
  },
  'trans-bus-avg': {
    id: 'trans-bus-avg',
    category: 'Transportation',
    activity: 'Bus (Average Passenger)',
    value: 0.08,
    unit: 'kg CO2e/km',
    geographicScope: 'Global / UK Average',
    source: 'UK Government GHG Conversion Factors for Company Reporting 2024',
    methodologyRef: 'DEFRA_2024_BUS',
    version: '1.0.0'
  },
  'trans-motorcycle-avg': {
    id: 'trans-motorcycle-avg',
    category: 'Transportation',
    activity: 'Motorcycle (Average)',
    value: 0.11,
    unit: 'kg CO2e/km',
    geographicScope: 'Global / UK Average',
    source: 'UK Government GHG Conversion Factors for Company Reporting 2024',
    methodologyRef: 'DEFRA_2024_MOTO',
    version: '1.0.0'
  },
  'trans-train-avg': {
    id: 'trans-train-avg',
    category: 'Transportation',
    activity: 'Train (National Rail)',
    value: 0.04,
    unit: 'kg CO2e/km',
    geographicScope: 'Global / UK Average',
    source: 'UK Government GHG Conversion Factors for Company Reporting 2024',
    methodologyRef: 'DEFRA_2024_TRAIN',
    version: '1.0.0'
  },
  'elec-grid-avg': {
    id: 'elec-grid-avg',
    category: 'Electricity',
    activity: 'Grid Electricity',
    value: 0.45,
    unit: 'kg CO2e/kWh',
    geographicScope: 'Global Average',
    source: 'International Energy Agency (IEA) World Energy Balances / Emission Factors 2024',
    methodologyRef: 'IEA_2024_GRID',
    version: '1.0.0'
  }
};
