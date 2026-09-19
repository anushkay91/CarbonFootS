import { ActivityRecord, CarbonGoal, GoalCheckIn, DataQuality } from '../types/domain';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_CATEGORIES = ['Transportation', 'Electricity', 'Food', 'Shopping', 'Waste'] as const;
const VALID_CADENCES = ['daily', 'weekly', 'monthly'] as const;

export function validateNumber(val: unknown, fieldName: string, allowZero = true): { value: number; error?: string } {
  if (typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val)) {
    return { value: 0, error: `${fieldName} must be a valid finite number.` };
  }
  if (allowZero && val < 0) {
    return { value: 0, error: `${fieldName} cannot be negative.` };
  }
  if (!allowZero && val <= 0) {
    return { value: 0, error: `${fieldName} must be greater than zero.` };
  }
  return { value: val };
}

export function validateString(val: unknown, fieldName: string, maxLength = 250): { value: string; error?: string } {
  if (typeof val !== 'string') {
    return { value: '', error: `${fieldName} must be a string.` };
  }
  const trimmed = val.trim();
  if (!trimmed) {
    return { value: '', error: `${fieldName} cannot be empty.` };
  }
  if (trimmed.length > maxLength) {
    return { value: trimmed.substring(0, maxLength), error: `${fieldName} exceeds maximum length of ${maxLength} characters.` };
  }
  return { value: trimmed };
}

export function validateDateString(val: unknown, fieldName: string): { value: string; error?: string } {
  if (typeof val !== 'string' || !val.trim()) {
    return { value: '', error: `${fieldName} date is required.` };
  }
  const parsed = new Date(val);
  if (Number.isNaN(parsed.getTime())) {
    return { value: '', error: `${fieldName} must be a valid date.` };
  }
  return { value: val };
}

export function validateActivityRecord(record: unknown): ValidationResult {
  const errors: string[] = [];
  if (!record || typeof record !== 'object') {
    return { valid: false, errors: ['Activity record must be a valid object.'] };
  }

  const rec = record as Record<string, unknown>;

  if (typeof rec.id !== 'string' || !rec.id.trim()) {
    errors.push('Activity ID is missing or invalid.');
  }

  if (typeof rec.category !== 'string' || !VALID_CATEGORIES.includes(rec.category as any)) {
    errors.push('Activity category is invalid.');
  }

  if (typeof rec.activityType !== 'string' || !rec.activityType.trim()) {
    errors.push('Activity type is missing.');
  }

  const co2e = validateNumber(rec.estimatedCO2e, 'Estimated CO₂e');
  if (co2e.error) errors.push(co2e.error);

  const dateRes = validateDateString(rec.localDate, 'Local date');
  if (dateRes.error) errors.push(dateRes.error);

  if (!rec.inputs || typeof rec.inputs !== 'object') {
    errors.push('Activity inputs object is missing.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateCarbonGoal(goal: unknown): ValidationResult {
  const errors: string[] = [];
  if (!goal || typeof goal !== 'object') {
    return { valid: false, errors: ['Goal must be a valid object.'] };
  }

  const g = goal as Record<string, unknown>;

  if (typeof g.id !== 'string' || !g.id.trim()) {
    errors.push('Goal ID is missing or invalid.');
  }

  const titleRes = validateString(g.title, 'Goal title', 200);
  if (titleRes.error) errors.push(titleRes.error);

  const targetRes = validateNumber(g.targetValue, 'Target value', false);
  if (targetRes.error) errors.push(targetRes.error);

  if (typeof g.cadence !== 'string' || !VALID_CADENCES.includes(g.cadence as any)) {
    errors.push('Goal cadence is invalid.');
  }

  const startRes = validateDateString(g.startDate, 'Start date');
  if (startRes.error) errors.push(startRes.error);

  const endRes = validateDateString(g.endDate, 'End date');
  if (endRes.error) errors.push(endRes.error);

  if (g.startDate && g.endDate && new Date(g.endDate as string) < new Date(g.startDate as string)) {
    errors.push('End date cannot be before start date.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateGoalCheckIn(checkIn: unknown): ValidationResult {
  const errors: string[] = [];
  if (!checkIn || typeof checkIn !== 'object') {
    return { valid: false, errors: ['Check-in must be a valid object.'] };
  }

  const c = checkIn as Record<string, unknown>;

  if (typeof c.id !== 'string' || !c.id.trim()) {
    errors.push('Check-in ID is missing or invalid.');
  }
  if (typeof c.goalId !== 'string' || !c.goalId.trim()) {
    errors.push('Goal ID is missing or invalid.');
  }

  const dateRes = validateDateString(c.date, 'Check-in date');
  if (dateRes.error) errors.push(dateRes.error);

  const valRes = validateNumber(c.value, 'Check-in value');
  if (valRes.error) errors.push(valRes.error);

  return {
    valid: errors.length === 0,
    errors
  };
}
