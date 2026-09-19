import { ActivityRecord, TrackingSummary } from '../types/domain';

export class TrackingSummaryEngine {
  static getSummary(
    records: ActivityRecord[],
    periodStart: string,
    periodEnd: string
  ): TrackingSummary {
    const periodRecords = records.filter(
      r => r.localDate >= periodStart && r.localDate <= periodEnd
    );

    const categoryTotals: Record<string, number> = {};
    let totalCO2e = 0;

    periodRecords.forEach(r => {
      totalCO2e += r.estimatedCO2e;
      categoryTotals[r.category] = (categoryTotals[r.category] || 0) + r.estimatedCO2e;
    });

    const categoriesRecorded = Object.keys(categoryTotals);
    
    // Calculate coverage (simple example: count unique days)
    const uniqueDays = new Set(periodRecords.map(r => r.localDate));

    return {
      periodStart,
      periodEnd,
      totalCO2e,
      activityCount: periodRecords.length,
      categoryTotals,
      coverageDays: uniqueDays.size,
      categoriesRecorded
    };
  }
}
