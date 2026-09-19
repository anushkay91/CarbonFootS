import { ActivityRecord, TrackingSummary, DailyDataItem, PeriodComparison, ComparabilityStatus, CategoryDetailSummary, SubcategorySummary } from '../types/domain';

function parseDate(dateStr: string): Date {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return new Date(NaN);
  }
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
}

function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return formatDate(d);
}

function getDaysBetween(startStr: string, endStr: string): string[] {
  const days: string[] = [];
  let current = startStr;
  let guard = 0;
  const startDate = parseDate(startStr);
  const endDate = parseDate(endStr);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
    return [];
  }
  while (current <= endStr && guard < 2000) {
    days.push(current);
    current = addDays(current, 1);
    guard++;
  }
  return days;
}

export class TrackingSummaryEngine {
  /**
   * Filters records strictly within the date range and ensures data integrity.
   */
  private static getValidPeriodRecords(records: ActivityRecord[], start: string, end: string): ActivityRecord[] {
    if (!Array.isArray(records)) return [];
    return records.filter(r => {
      if (!r || typeof r.localDate !== 'string') return false;
      if (r.localDate < start || r.localDate > end) return false;
      if (typeof r.estimatedCO2e !== 'number' || !Number.isFinite(r.estimatedCO2e) || r.estimatedCO2e < 0) {
        return false;
      }
      return true;
    });
  }

  static getCategoryTotals(records: ActivityRecord[], start: string, end: string): Record<string, number> {
    const validRecords = TrackingSummaryEngine.getValidPeriodRecords(records, start, end);
    const categoryTotals: Record<string, number> = {};
    validRecords.forEach(r => {
      categoryTotals[r.category] = (categoryTotals[r.category] || 0) + r.estimatedCO2e;
    });
    return categoryTotals;
  }

  static getCoverage(records: ActivityRecord[], start: string, end: string) {
    const allDays = getDaysBetween(start, end);
    const periodDays = allDays.length;
    if (periodDays === 0) {
      return { periodDays: 0, recordedDays: 0, coverageRatio: 0, hasData: false };
    }
    const validRecords = TrackingSummaryEngine.getValidPeriodRecords(records, start, end);
    const uniqueRecordedDays = new Set(validRecords.map(r => r.localDate));
    const recordedDays = uniqueRecordedDays.size;
    const coverageRatio = Number((recordedDays / periodDays).toFixed(4));
    return {
      periodDays,
      recordedDays,
      coverageRatio,
      hasData: validRecords.length > 0
    };
  }

  static getDailyBreakdown(records: ActivityRecord[], start: string, end: string): DailyDataItem[] {
    const allDays = getDaysBetween(start, end);
    const validRecords = TrackingSummaryEngine.getValidPeriodRecords(records, start, end);
    
    const map = new Map<string, { total: number; count: number }>();
    validRecords.forEach(r => {
      const existing = map.get(r.localDate) || { total: 0, count: 0 };
      existing.total += r.estimatedCO2e;
      existing.count += 1;
      map.set(r.localDate, existing);
    });

    return allDays.map(date => {
      const entry = map.get(date);
      if (entry) {
        return {
          date,
          totalCO2e: entry.total,
          activityCount: entry.count,
          hasData: true
        };
      }
      return {
        date,
        totalCO2e: null,
        activityCount: 0,
        hasData: false
      };
    });
  }

  static getLargestReportedSource(records: ActivityRecord[], start: string, end: string): string | undefined {
    const categoryTotals = TrackingSummaryEngine.getCategoryTotals(records, start, end);
    let maxCategory: string | undefined = undefined;
    let maxVal = -1;
    for (const [cat, val] of Object.entries(categoryTotals)) {
      if (val > maxVal) {
        maxVal = val;
        maxCategory = cat;
      }
    }
    return maxCategory;
  }

  static getPreviousPeriodRange(start: string, end: string): { start: string; end: string } | null {
    const startDate = parseDate(start);
    const endDate = parseDate(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
      return null;
    }
    const durationDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const prevEnd = addDays(start, -1);
    const prevStart = addDays(prevEnd, -(durationDays - 1));
    return { start: prevStart, end: prevEnd };
  }

  static getComparison(records: ActivityRecord[], start: string, end: string): PeriodComparison {
    const validCurrent = TrackingSummaryEngine.getValidPeriodRecords(records, start, end);
    const currentTotal = validCurrent.reduce((sum, r) => sum + r.estimatedCO2e, 0);

    const prevRange = TrackingSummaryEngine.getPreviousPeriodRange(start, end);
    if (!prevRange) {
      return {
        currentTotal,
        previousTotal: null,
        absoluteDifference: null,
        percentageChange: null,
        status: 'no-previous-data'
      };
    }

    const validPrevious = TrackingSummaryEngine.getValidPeriodRecords(records, prevRange.start, prevRange.end);
    
    // Check if previous period has records
    if (validPrevious.length === 0) {
      return {
        currentTotal,
        previousTotal: null,
        absoluteDifference: null,
        percentageChange: null,
        status: 'no-previous-data'
      };
    }

    const previousTotal = validPrevious.reduce((sum, r) => sum + r.estimatedCO2e, 0);
    const absoluteDifference = Number((currentTotal - previousTotal).toFixed(4));
    
    let percentageChange: number | null = null;
    if (previousTotal > 0) {
      percentageChange = Number((((currentTotal - previousTotal) / previousTotal) * 100).toFixed(2));
    }

    // Determine comparability based on coverage ratio or data availability
    const currentCoverage = TrackingSummaryEngine.getCoverage(records, start, end);
    const prevCoverage = TrackingSummaryEngine.getCoverage(records, prevRange.start, prevRange.end);

    let status: ComparabilityStatus = 'comparable';
    // If coverage ratio differs significantly or either coverage is very low, mark not-comparable
    if (Math.abs(currentCoverage.coverageRatio - prevCoverage.coverageRatio) > 0.5) {
      status = 'not-comparable';
    }

    return {
      currentTotal,
      previousTotal,
      absoluteDifference,
      percentageChange,
      status
    };
  }

  static getCategoryDetails(records: ActivityRecord[], start: string, end: string): Record<string, CategoryDetailSummary> {
    const validRecords = TrackingSummaryEngine.getValidPeriodRecords(records, start, end);
    let totalCO2e = 0;
    validRecords.forEach(r => { totalCO2e += r.estimatedCO2e; });

    // Group by category, then by activityType (subcategory)
    const categoryMap = new Map<string, { total: number; count: number; subMap: Map<string, { total: number; count: number }> }>();

    validRecords.forEach(r => {
      let catEntry = categoryMap.get(r.category);
      if (!catEntry) {
        catEntry = { total: 0, count: 0, subMap: new Map() };
        categoryMap.set(r.category, catEntry);
      }
      catEntry.total += r.estimatedCO2e;
      catEntry.count += 1;

      let subEntry = catEntry.subMap.get(r.activityType);
      if (!subEntry) {
        subEntry = { total: 0, count: 0 };
        catEntry.subMap.set(r.activityType, subEntry);
      }
      subEntry.total += r.estimatedCO2e;
      subEntry.count += 1;
    });

    const categoryDetails: Record<string, CategoryDetailSummary> = {};

    categoryMap.forEach((catVal, category) => {
      const shareOfTotal = totalCO2e > 0 ? Number(((catVal.total / totalCO2e) * 100).toFixed(2)) : 0;
      
      const subcategories: SubcategorySummary[] = [];
      let maxSubTotal = -1;
      let largestSubtype: string | undefined = undefined;

      catVal.subMap.forEach((subVal, activityType) => {
        const shareOfCategory = catVal.total > 0 ? Number(((subVal.total / catVal.total) * 100).toFixed(2)) : 0;
        const shareOfTotalSub = totalCO2e > 0 ? Number(((subVal.total / totalCO2e) * 100).toFixed(2)) : 0;

        if (subVal.total > maxSubTotal) {
          maxSubTotal = subVal.total;
          largestSubtype = activityType;
        }

        subcategories.push({
          activityType,
          totalCO2e: Number(subVal.total.toFixed(4)),
          activityCount: subVal.count,
          shareOfCategory,
          shareOfTotal: shareOfTotalSub
        });
      });

      // Sort subcategories descending by totalCO2e
      subcategories.sort((a, b) => b.totalCO2e - a.totalCO2e);

      categoryDetails[category] = {
        category,
        totalCO2e: Number(catVal.total.toFixed(4)),
        activityCount: catVal.count,
        shareOfTotal,
        subcategories,
        largestSubtype
      };
    });

    return categoryDetails;
  }

  static getSummary(
    records: ActivityRecord[],
    periodStart: string,
    periodEnd: string
  ): TrackingSummary {
    const validRecords = TrackingSummaryEngine.getValidPeriodRecords(records, periodStart, periodEnd);
    const categoryTotals = TrackingSummaryEngine.getCategoryTotals(records, periodStart, periodEnd);
    const categoryDetails = TrackingSummaryEngine.getCategoryDetails(records, periodStart, periodEnd);
    
    let totalCO2e = 0;
    validRecords.forEach(r => {
      totalCO2e += r.estimatedCO2e;
    });
    totalCO2e = Number(totalCO2e.toFixed(4));

    const categoriesRecorded = Object.keys(categoryTotals);
    const coverage = TrackingSummaryEngine.getCoverage(records, periodStart, periodEnd);
    const dailyBreakdown = TrackingSummaryEngine.getDailyBreakdown(records, periodStart, periodEnd);
    const largestReportedSource = TrackingSummaryEngine.getLargestReportedSource(records, periodStart, periodEnd);
    
    // Find largest subtype source globally
    let largestSubtypeSource: { category: string; activityType: string; totalCO2e: number } | undefined = undefined;
    let maxSubCo2 = -1;
    Object.values(categoryDetails).forEach(cd => {
      cd.subcategories.forEach(sub => {
        if (sub.totalCO2e > maxSubCo2) {
          maxSubCo2 = sub.totalCO2e;
          largestSubtypeSource = {
            category: cd.category,
            activityType: sub.activityType,
            totalCO2e: sub.totalCO2e
          };
        }
      });
    });

    const comparison = TrackingSummaryEngine.getComparison(records, periodStart, periodEnd);
    const prevRange = TrackingSummaryEngine.getPreviousPeriodRange(periodStart, periodEnd);

    return {
      periodStart,
      periodEnd,
      totalCO2e,
      activityCount: validRecords.length,
      categoryTotals,
      categoryDetails,
      coverageDays: coverage.recordedDays,
      periodDays: coverage.periodDays,
      coverageRatio: coverage.coverageRatio,
      hasData: coverage.hasData,
      categoriesRecorded,
      largestReportedSource,
      largestSubtypeSource,
      dailyBreakdown,
      comparison,
      previousPeriodStart: prevRange?.start,
      previousPeriodEnd: prevRange?.end
    };
  }
}
