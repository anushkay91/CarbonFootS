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
  // Optional activity-linked properties for A5
  linkedCategory?: string;
  linkedActivityType?: string;
  linkedFactorId?: string;
  baselineValue?: number;
  baselineCO2e?: number;
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

export interface SubcategorySummary {
  activityType: string;
  totalCO2e: number;
  activityCount: number;
  shareOfCategory: number; // percentage 0-100
  shareOfTotal: number; // percentage 0-100
}

export interface CategoryDetailSummary {
  category: string;
  totalCO2e: number;
  activityCount: number;
  shareOfTotal: number; // percentage 0-100
  subcategories: SubcategorySummary[];
  largestSubtype?: string;
}

export type ComparabilityStatus = 'comparable' | 'not-comparable' | 'no-previous-data';

export interface DailyDataItem {
  date: string;
  totalCO2e: number | null;
  activityCount: number;
  hasData: boolean;
}

export interface PeriodComparison {
  currentTotal: number;
  previousTotal: number | null;
  absoluteDifference: number | null;
  percentageChange: number | null;
  status: ComparabilityStatus;
}

export interface TrackingSummary {
  periodStart: string;
  periodEnd: string;
  totalCO2e: number;
  activityCount: number;
  categoryTotals: Record<string, number>;
  categoryDetails: Record<string, CategoryDetailSummary>;
  coverageDays: number;
  periodDays: number;
  coverageRatio: number;
  hasData: boolean;
  categoriesRecorded: string[];
  largestReportedSource?: string;
  largestSubtypeSource?: { category: string; activityType: string; totalCO2e: number };
  dailyBreakdown: DailyDataItem[];
  comparison?: PeriodComparison;
  previousPeriodStart?: string;
  previousPeriodEnd?: string;
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
