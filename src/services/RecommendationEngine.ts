import { ActivityRecord, CarbonGoal } from '../types/domain';
import { GoalAnalyticsEngine } from './GoalAnalyticsEngine';
import { TrackingSummaryEngine } from './TrackingSummaryEngine';

export interface Recommendation {
  id: string;
  title: string;
  action: string;
  reasonCode: 'ACTIVE_GOAL_GAP' | 'LARGEST_ACTIVITY_HOTSPOT' | 'LIMITED_DATA' | 'NO_DATA';
  reasonText: string;
  evidence: {
    category?: string;
    activityType?: string;
    currentValue?: number;
    targetValue?: number;
    unit?: string;
    estimatedCO2e?: number;
  };
  potentialReduction?: {
    value: number;
    unit: string; // e.g. "kg CO₂e/period"
  };
  priority: number; // 1 = highest
  dataQuality: 'High' | 'Medium' | 'Low';
}

export class RecommendationEngine {
  static getPrimaryRecommendation(records: ActivityRecord[], goals: CarbonGoal[]): Recommendation {
    if (!records || records.length === 0) {
      return {
        id: 'rec-no-data',
        title: 'No personalized action yet',
        action: 'Record your first activity',
        reasonCode: 'NO_DATA',
        reasonText: 'Record a few activities to let CarbonFootS identify your largest reported emission sources.',
        evidence: {},
        priority: 10,
        dataQuality: 'Low'
      };
    }

    if (records.length < 2) {
      return {
        id: 'rec-limited-data',
        title: 'Early insight',
        action: 'Continue tracking activities',
        reasonCode: 'LIMITED_DATA',
        reasonText: "You've recorded initial activity, but more data will make future recommendations more representative.",
        evidence: {},
        priority: 5,
        dataQuality: 'Medium'
      };
    }

    // 1. Check for active goal gap
    const activeGoal = goals.find(g => g.status === 'active' && (g.linkedActivityType || g.linkedCategory));
    if (activeGoal) {
      const analysis = GoalAnalyticsEngine.analyzeGoalProgress(activeGoal, records);
      if (analysis.hasEnoughData && !analysis.isAchieved) {
        const gap = Number((analysis.currentValue - analysis.targetValue).toFixed(2));
        const potentialDiff = Number((analysis.currentCO2e * (gap / Math.max(1, analysis.currentValue))).toFixed(2));

        return {
          id: `rec-goal-${activeGoal.id}`,
          title: `Reduce ${activeGoal.linkedActivityType || activeGoal.title}`,
          action: `Reduce usage by ${gap} ${activeGoal.unit} to meet your active ${activeGoal.cadence} target.`,
          reasonCode: 'ACTIVE_GOAL_GAP',
          reasonText: `Your current recorded activity (${analysis.currentValue} ${activeGoal.unit}) exceeds your active target limit (${activeGoal.targetValue} ${activeGoal.unit}).`,
          evidence: {
            activityType: activeGoal.linkedActivityType,
            currentValue: analysis.currentValue,
            targetValue: activeGoal.targetValue,
            unit: activeGoal.unit,
            estimatedCO2e: analysis.currentCO2e
          },
          potentialReduction: potentialDiff > 0 ? {
            value: potentialDiff,
            unit: 'kg CO₂e'
          } : undefined,
          priority: 1,
          dataQuality: 'High'
        };
      }
    }

    // 2. Fall back to largest reported hotspot source from A4 summary
    const summary = TrackingSummaryEngine.getSummary(records, new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0], new Date().toISOString().split('T')[0]);
    if (summary.largestSubtypeSource) {
      const hotspot = summary.largestSubtypeSource;
      return {
        id: `rec-hotspot-${hotspot.activityType}`,
        title: `Optimize ${hotspot.activityType}`,
        action: `Consider reviewing your recorded ${hotspot.activityType} usage, which is currently your largest emission source.`,
        reasonCode: 'LARGEST_ACTIVITY_HOTSPOT',
        reasonText: `${hotspot.activityType} represents your largest reported activity type (${hotspot.totalCO2e.toFixed(1)} kg CO₂e).`,
        evidence: {
          category: hotspot.category,
          activityType: hotspot.activityType,
          estimatedCO2e: hotspot.totalCO2e
        },
        priority: 2,
        dataQuality: 'High'
      };
    }

    return {
      id: 'rec-default',
      title: 'Maintain balanced tracking',
      action: 'Continue logging your daily activities across categories.',
      reasonCode: 'LIMITED_DATA',
      reasonText: 'Your recorded activities are balanced across multiple categories.',
      evidence: {},
      priority: 3,
      dataQuality: 'Medium'
    };
  }
}
