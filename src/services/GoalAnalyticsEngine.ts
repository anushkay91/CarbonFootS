import { ActivityRecord, CarbonGoal } from '../types/domain';

export interface GoalProgressAnalysis {
  goalId: string;
  isActivityLinked: boolean;
  currentValue: number;
  currentCO2e: number;
  baselineValue: number;
  baselineCO2e: number;
  targetValue: number;
  cadence: string;
  changeValue: number; // current - baseline
  changeCO2e: number; // currentCO2e - baselineCO2e
  direction: 'decrease' | 'increase' | 'stable';
  isAchieved: boolean;
  hasEnoughData: boolean;
  statusMessage: string;
}

export class GoalAnalyticsEngine {
  /**
   * Helper to determine date range for the cadence ending today or goal end date.
   */
  private static getCadenceDateRange(cadence: 'daily' | 'weekly' | 'monthly'): { start: string; end: string } {
    const endObj = new Date();
    const endStr = endObj.toISOString().split('T')[0];
    const startObj = new Date(endObj);

    if (cadence === 'daily') {
      // today only
    } else if (cadence === 'weekly') {
      startObj.setUTCDate(startObj.getUTCDate() - 6); // last 7 days
    } else if (cadence === 'monthly') {
      startObj.setUTCDate(startObj.getUTCDate() - 29); // last 30 days
    }

    const startStr = startObj.toISOString().split('T')[0];
    return { start: startStr, end: endStr };
  }

  /**
   * Helper to determine previous baseline period range of equal duration.
   */
  private static getBaselineDateRange(cadence: 'daily' | 'weekly' | 'monthly', currentStart: string): { start: string; end: string } {
    const currStartObj = new Date(currentStart);
    const endObj = new Date(currStartObj);
    endObj.setUTCDate(endObj.getUTCDate() - 1); // day before current start

    const startObj = new Date(endObj);
    if (cadence === 'daily') {
      // 1 day before
    } else if (cadence === 'weekly') {
      startObj.setUTCDate(startObj.getUTCDate() - 6);
    } else if (cadence === 'monthly') {
      startObj.setUTCDate(startObj.getUTCDate() - 29);
    }

    return {
      start: startObj.toISOString().split('T')[0],
      end: endObj.toISOString().split('T')[0]
    };
  }

  static analyzeGoalProgress(goal: CarbonGoal, records: ActivityRecord[]): GoalProgressAnalysis {
    const isActivityLinked = Boolean(goal.linkedActivityType || goal.linkedCategory || goal.linkedFactorId);

    if (!isActivityLinked) {
      // Manual goal fallback
      return {
        goalId: goal.id,
        isActivityLinked: false,
        currentValue: 0,
        currentCO2e: 0,
        baselineValue: 0,
        baselineCO2e: 0,
        targetValue: goal.targetValue,
        cadence: goal.cadence,
        changeValue: 0,
        changeCO2e: 0,
        direction: 'stable',
        isAchieved: goal.status === 'completed',
        hasEnoughData: true,
        statusMessage: 'Manual progress tracked via check-ins.'
      };
    }

    // Filter records matching the linked criteria (by factorId or activityType or category)
    const matchingRecords = records.filter(r => {
      if (!r || typeof r.localDate !== 'string' || typeof r.estimatedCO2e !== 'number') return false;
      if (goal.linkedFactorId && r.emissionFactorId === goal.linkedFactorId) return true;
      if (goal.linkedActivityType && r.activityType === goal.linkedActivityType) return true;
      if (goal.linkedCategory && r.category === goal.linkedCategory && !goal.linkedActivityType) return true;
      return false;
    });

    const { start: currStart, end: currEnd } = GoalAnalyticsEngine.getCadenceDateRange(goal.cadence);
    const { start: baseStart, end: baseEnd } = GoalAnalyticsEngine.getBaselineDateRange(goal.cadence, currStart);

    // Current period records
    const currentPeriodRecords = matchingRecords.filter(r => r.localDate >= currStart && r.localDate <= currEnd);
    
    // Baseline period records
    const baselinePeriodRecords = matchingRecords.filter(r => r.localDate >= baseStart && r.localDate <= baseEnd);

    // Sum metric values (e.g. distanceKm, kwh, or count) and CO2e
    const sumMetric = (recs: ActivityRecord[]): number => {
      return recs.reduce((sum, r) => {
        const inputs = r.inputs || {};
        // If distanceKm exists, use it; if kwh exists, use it; otherwise count as 1 or quantity
        const val = Number(inputs.distanceKm ?? inputs.kwh ?? inputs.quantity ?? 1);
        return sum + (Number.isFinite(val) ? val : 1);
      }, 0);
    };

    const sumCO2e = (recs: ActivityRecord[]): number => {
      return recs.reduce((sum, r) => sum + (Number.isFinite(r.estimatedCO2e) ? r.estimatedCO2e : 0), 0);
    };

    const currentValue = Number(sumMetric(currentPeriodRecords).toFixed(2));
    const currentCO2e = Number(sumCO2e(currentPeriodRecords).toFixed(2));

    // Baseline value: use stored baselineValue if available, otherwise derive from baseline period
    let baselineValue = goal.baselineValue ?? 0;
    let baselineCO2e = goal.baselineCO2e ?? 0;

    if (goal.baselineValue === undefined && baselinePeriodRecords.length > 0) {
      baselineValue = Number(sumMetric(baselinePeriodRecords).toFixed(2));
      baselineCO2e = Number(sumCO2e(baselinePeriodRecords).toFixed(2));
    } else if (goal.baselineValue === undefined) {
      // Default baseline estimate if no historical records exist
      baselineValue = currentValue > 0 ? currentValue * 1.1 : goal.targetValue * 1.2;
      baselineCO2e = currentCO2e > 0 ? currentCO2e * 1.1 : goal.targetValue * 0.15;
    }

    const hasEnoughData = currentPeriodRecords.length > 0;
    const changeValue = Number((currentValue - baselineValue).toFixed(2));
    const changeCO2e = Number((currentCO2e - baselineCO2e).toFixed(2));

    let direction: 'decrease' | 'increase' | 'stable' = 'stable';
    if (changeValue < -0.05) direction = 'decrease';
    else if (changeValue > 0.05) direction = 'increase';

    // Target semantic: for reduction goals, target is maximum allowed value (e.g. <= targetValue)
    const isAchieved = currentValue <= goal.targetValue;

    let statusMessage = '';
    if (!hasEnoughData) {
      statusMessage = 'Not enough recorded activity for this cadence yet.';
    } else if (isAchieved) {
      statusMessage = 'Target achieved: current activity is within goal limit.';
    } else {
      statusMessage = 'Current activity exceeds target limit.';
    }

    return {
      goalId: goal.id,
      isActivityLinked: true,
      currentValue,
      currentCO2e,
      baselineValue,
      baselineCO2e,
      targetValue: goal.targetValue,
      cadence: goal.cadence,
      changeValue,
      changeCO2e,
      direction,
      isAchieved,
      hasEnoughData,
      statusMessage
    };
  }
}
