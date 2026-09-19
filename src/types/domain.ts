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

export interface CalculationResult {
  value: number; // Calculated CO2e
  unit: string; // CO2e unit
  category: string;
  activityId: string;
  factor: EmissionFactor;
  assumptions: string[];
  dataQuality: DataQuality;
}

export interface Activity {
  id: string;
  type: 'Transportation' | 'Electricity' | 'Food' | 'Shopping' | 'Waste';
  date: Date;
  quality: DataQuality;
  rawInput: any;
}

// Concrete activity types
export interface TransportationActivity extends Activity {
  type: 'Transportation';
  vehicleCategory: string;
  fuelType: string;
  distanceKm: number;
  frequency: number; // e.g., times per week
}

export interface ElectricityActivity extends Activity {
  type: 'Electricity';
  kwh: number;
  source: 'Bill' | 'ApplianceEstimate';
}

export interface FoodActivity extends Activity {
  type: 'Food';
  category: 'Red meat' | 'Chicken' | 'Fish' | 'Eggs' | 'Dairy' | 'Plant-based';
  frequency: 'Never' | 'Occasionally' | '1-2 times/week' | '3-5 times/week' | 'Daily';
}

export interface ShoppingActivity extends Activity {
  type: 'Shopping';
  category: 'Clothing' | 'Footwear' | 'Electronics' | 'Furniture' | 'Personal care' | 'Household goods';
  quantity: number;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly';
}

export interface WasteActivity extends Activity {
  type: 'Waste';
  category: 'Plastic' | 'Paper' | 'Glass' | 'Metal' | 'Organic';
  frequency: 'Daily' | 'Weekly';
  recyclingBehavior: 'Always' | 'Sometimes' | 'Never';
}
