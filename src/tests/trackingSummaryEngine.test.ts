import { describe, it, expect } from 'vitest';
import { TrackingSummaryEngine } from '../services/TrackingSummaryEngine';
import { ActivityRecord } from '../types/domain';

const sampleRecords: ActivityRecord[] = [
  {
    id: '1',
    occurredAt: '2026-09-15T10:00:00.000Z',
    localDate: '2026-09-15',
    category: 'Transportation',
    activityType: 'Driving Car (Petrol)',
    inputs: { distanceKm: 10 },
    normalizedInputs: { distanceKm: 10 },
    estimatedCO2e: 1.5,
    unit: 'kg CO2e',
    emissionFactorId: 'trans-car-petrol',
    emissionFactorVersion: '1.0.0',
    dataQuality: 'Medium',
    assumptions: [],
    source: 'manual',
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z'
  },
  {
    id: '2',
    occurredAt: '2026-09-15T14:00:00.000Z',
    localDate: '2026-09-15',
    category: 'Electricity',
    activityType: 'Grid Electricity',
    inputs: { kwh: 5 },
    normalizedInputs: { kwh: 5 },
    estimatedCO2e: 2.25,
    unit: 'kg CO2e',
    emissionFactorId: 'elec-grid-avg',
    emissionFactorVersion: '1.0.0',
    dataQuality: 'High',
    assumptions: [],
    source: 'manual',
    createdAt: '2026-09-15T14:00:00.000Z',
    updatedAt: '2026-09-15T14:00:00.000Z'
  },
  {
    id: '3',
    occurredAt: '2026-09-17T09:00:00.000Z',
    localDate: '2026-09-17',
    category: 'Transportation',
    activityType: 'Driving Car (Petrol)',
    inputs: { distanceKm: 20 },
    normalizedInputs: { distanceKm: 20 },
    estimatedCO2e: 3.0,
    unit: 'kg CO2e',
    emissionFactorId: 'trans-car-petrol',
    emissionFactorVersion: '1.0.0',
    dataQuality: 'Medium',
    assumptions: [],
    source: 'manual',
    createdAt: '2026-09-17T09:00:00.000Z',
    updatedAt: '2026-09-17T09:00:00.000Z'
  }
];

describe('TrackingSummaryEngine', () => {
  it('performs basic aggregation correctly for a 3-day period', () => {
    const summary = TrackingSummaryEngine.getSummary(sampleRecords, '2026-09-15', '2026-09-17');
    expect(summary.totalCO2e).toBe(6.75); // 1.5 + 2.25 + 3.0
    expect(summary.activityCount).toBe(3);
    expect(summary.categoryTotals['Transportation']).toBe(4.5);
    expect(summary.categoryTotals['Electricity']).toBe(2.25);
  });

  it('handles empty periods correctly', () => {
    const summary = TrackingSummaryEngine.getSummary(sampleRecords, '2026-09-20', '2026-09-25');
    expect(summary.totalCO2e).toBe(0);
    expect(summary.activityCount).toBe(0);
    expect(summary.hasData).toBe(false);
    expect(summary.largestReportedSource).toBeUndefined();
    expect(summary.coverageDays).toBe(0);
  });

  it('handles multiple activities on the same day correctly', () => {
    const daily = TrackingSummaryEngine.getDailyBreakdown(sampleRecords, '2026-09-15', '2026-09-15');
    expect(daily.length).toBe(1);
    expect(daily[0].activityCount).toBe(2);
    expect(daily[0].totalCO2e).toBe(3.75);
    expect(daily[0].hasData).toBe(true);
  });

  it('distinguishes missing days from zero emissions', () => {
    const daily = TrackingSummaryEngine.getDailyBreakdown(sampleRecords, '2026-09-15', '2026-09-17');
    // Sep 15: has data (3.75)
    // Sep 16: missing data (null totalCO2e, 0 activityCount, hasData: false)
    // Sep 17: has data (3.0)
    expect(daily[0].date).toBe('2026-09-15');
    expect(daily[0].hasData).toBe(true);

    expect(daily[1].date).toBe('2026-09-16');
    expect(daily[1].totalCO2e).toBeNull();
    expect(daily[1].activityCount).toBe(0);
    expect(daily[1].hasData).toBe(false);

    expect(daily[2].date).toBe('2026-09-17');
    expect(daily[2].hasData).toBe(true);
  });

  it('calculates coverage correctly', () => {
    const coverage = TrackingSummaryEngine.getCoverage(sampleRecords, '2026-09-15', '2026-09-17');
    expect(coverage.periodDays).toBe(3);
    expect(coverage.recordedDays).toBe(2); // Sep 15 and Sep 17
    expect(coverage.coverageRatio).toBeCloseTo(2 / 3, 4);
  });

  it('identifies the largest reported source correctly', () => {
    const largest = TrackingSummaryEngine.getLargestReportedSource(sampleRecords, '2026-09-15', '2026-09-17');
    expect(largest).toBe('Transportation'); // 4.5 vs 2.25
  });

  it('calculates previous comparable period range', () => {
    // 2026-09-15 to 2026-09-17 is 3 days
    const prevRange = TrackingSummaryEngine.getPreviousPeriodRange('2026-09-15', '2026-09-17');
    expect(prevRange).not.toBeNull();
    expect(prevRange?.start).toBe('2026-09-12');
    expect(prevRange?.end).toBe('2026-09-14');
  });

  it('handles comparison when no previous data exists', () => {
    const comparison = TrackingSummaryEngine.getComparison(sampleRecords, '2026-09-15', '2026-09-17');
    expect(comparison.status).toBe('no-previous-data');
    expect(comparison.previousTotal).toBeNull();
  });

  it('calculates comparison percentage change when previous data exists', () => {
    const prevRecord: ActivityRecord = {
      id: 'prev-1',
      occurredAt: '2026-09-13T10:00:00.000Z',
      localDate: '2026-09-13',
      category: 'Transportation',
      activityType: 'Driving Car (Petrol)',
      inputs: { distanceKm: 10 },
      normalizedInputs: { distanceKm: 10 },
      estimatedCO2e: 10.0,
      unit: 'kg CO2e',
      emissionFactorId: 'trans-car-petrol',
      emissionFactorVersion: '1.0.0',
      dataQuality: 'Medium',
      assumptions: [],
      source: 'manual',
      createdAt: '2026-09-13T10:00:00.000Z',
      updatedAt: '2026-09-13T10:00:00.000Z'
    };

    const all = [...sampleRecords, prevRecord];
    // Current: 2026-09-15 to 2026-09-17 (Total = 6.75)
    // Prev: 2026-09-12 to 2026-09-14 (Total = 10.0)
    const comparison = TrackingSummaryEngine.getComparison(all, '2026-09-15', '2026-09-17');
    expect(comparison.status).toBe('comparable');
    expect(comparison.currentTotal).toBe(6.75);
    expect(comparison.previousTotal).toBe(10.0);
    expect(comparison.absoluteDifference).toBe(-3.25);
    expect(comparison.percentageChange).toBe(-32.5); // (6.75 - 10) / 10 * 100 = -32.5%
  });

  it('handles invalid values and safeguards against NaN/Infinity', () => {
    const badRecord: ActivityRecord = {
      id: 'bad-1',
      occurredAt: '2026-09-15T10:00:00.000Z',
      localDate: '2026-09-15',
      category: 'Transportation',
      activityType: 'Bad',
      inputs: {},
      normalizedInputs: {},
      estimatedCO2e: NaN,
      unit: 'kg CO2e',
      dataQuality: 'Low',
      assumptions: [],
      source: 'manual',
      createdAt: '',
      updatedAt: ''
    };
    const summary = TrackingSummaryEngine.getSummary([badRecord], '2026-09-15', '2026-09-15');
    expect(summary.totalCO2e).toBe(0);
    expect(summary.activityCount).toBe(0);
  });

  it('ensures input records array is immutable', () => {
    const recordsCopy = [...sampleRecords];
    TrackingSummaryEngine.getSummary(sampleRecords, '2026-09-15', '2026-09-17');
    expect(sampleRecords).toEqual(recordsCopy);
  });
});
