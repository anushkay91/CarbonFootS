/**
 * Core Domain Models
 */

export type DataQuality = 'High' | 'Medium' | 'Low';

export interface EmissionFactor {
  id: string;
  category: 'Transportation' | 'Electricity' | 'Food' | 'Shopping' | 'Waste';
  activity: string;
  value: number; // Factor value
  unit: string; // Unit of factor (e.g., kg CO2e/km)
  geographicScope?: string;
  source: string;
  methodologyRef: string;
  version: string;
  uncertainty?: string;
}

export interface ActivityRecord {
  id: string;
  occurredAt: string; // ISO timestamp
  localDate: string; // YYYY-MM-DD
  category: 'Transportation' | 'Electricity' | 'Food' | 'Shopping' | 'Waste';
  activityType: string;
  inputs: Record<string, unknown>;
  normalizedInputs: Record<string, unknown>;
  estimatedCO2e: number;
  unit: 'kg CO2e';
  emissionFactorId?: string;
  emissionFactorVersion?: string;
  dataQuality: DataQuality;
  assumptions: string[];
  source: 'manual' | 'bill' | 'appliance-estimate' | 'image-confirmed' | 'imported';
  createdAt: string;
  updatedAt: string;
}

export interface CarbonGoal {
  id: string;
  actionId: string;
  title: string;
  metric: 'count' | 'distance' | 'quantity' | 'frequency';
  targetValue: number;
  unit: string;
  cadence: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'skipped' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

export interface GoalCheckIn {
  id: string;
  goalId: string;
  date: string;
  value: number;
  source: 'self-reported' | 'activity-derived';
  note?: string;
  createdAt: string;
}

export interface TrackingSummary {
  periodStart: string;
  periodEnd: string;
  totalCO2e: number;
  activityCount: number;
  categoryTotals: Record<string, number>;
  coverageDays: number;
  categoriesRecorded: string[];
  previousPeriodCO2e?: number;
  percentageChange?: number;
  largestReportedSource?: string;
}

// Keep existing concrete activity types, but they now feed into ActivityRecord creation
export interface CalculationResult {
  value: number; // Calculated CO2e
  unit: 'kg CO2e';
  category: string;
  activityId: string;
  factor: EmissionFactor;
  assumptions: string[];
  dataQuality: DataQuality;
}

// Core domain models for tracking and analysis are defined above.
