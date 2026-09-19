import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { ActivityRepository } from '../services/ActivityRepository';
import { GoalRepository } from '../services/GoalRepository';
import { TrackingSummaryEngine } from '../services/TrackingSummaryEngine';
import { RecommendationEngine } from '../services/RecommendationEngine';
import { PeriodSelector } from '../components/dashboard/PeriodSelector';
import { EmptyState } from '../components/dashboard/EmptyState';
import { FootprintSummaryCard } from '../components/dashboard/FootprintSummaryCard';
import { CoverageCard } from '../components/dashboard/CoverageCard';
import { ComparisonCard } from '../components/dashboard/ComparisonCard';
import { LargestSourceCard } from '../components/dashboard/LargestSourceCard';
import { CategoryBreakdownSection } from '../components/dashboard/CategoryBreakdownSection';
import { DailyTrendSection } from '../components/dashboard/DailyTrendSection';
import { ActiveGoalSummaryCard } from '../components/dashboard/ActiveGoalSummaryCard';
import { RecommendationCard } from '../components/dashboard/RecommendationCard';
import { GeminiCoachCard } from '../components/dashboard/GeminiCoachCard';

function getPeriodDates(days: number) {
  const end = new Date();
  const endStr = end.toISOString().split('T')[0];
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const startStr = start.toISOString().split('T')[0];
  return { start: startStr, end: endStr };
}

export default function DashboardPage() {
  const [days, setDays] = useState<number>(30);
  const records = useMemo(() => ActivityRepository.getAll(), []);
  const goals = useMemo(() => GoalRepository.getGoals(), []);
  const activeGoal = goals.find(g => g.status === 'active');
  const primaryRecommendation = useMemo(() => RecommendationEngine.getPrimaryRecommendation(records, goals), [records, goals]);

  const { start, end } = useMemo(() => getPeriodDates(days), [days]);

  const summary = useMemo(() => {
    return TrackingSummaryEngine.getSummary(records, start, end);
  }, [records, start, end]);

  if (records.length === 0) {
    return (
      <Layout>
        <h1 className="text-3xl font-bold text-slate-950 mb-6">Dashboard</h1>
        <EmptyState />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Dashboard</h1>
          <p className="text-slate-600 text-sm mt-1">Review your estimated footprint and tracking trends.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <PeriodSelector selectedDays={days} onSelectDays={setDays} />
        </div>
      </div>

      <div className="space-y-6">
        {/* Top metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FootprintSummaryCard totalCO2e={summary.totalCO2e} activityCount={summary.activityCount} />
          <CoverageCard recordedDays={summary.coverageDays} periodDays={summary.periodDays} hasData={summary.hasData} />
          <ComparisonCard comparison={summary.comparison} />
          <LargestSourceCard largestSource={summary.largestReportedSource} categoryTotals={summary.categoryTotals} />
        </div>

        {/* Active Goal Summary & Recommendation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeGoal && (
            <ActiveGoalSummaryCard goal={activeGoal} records={records} />
          )}
          <RecommendationCard recommendation={primaryRecommendation} records={records} activeGoal={activeGoal} />
        </div>

        {/* Gemini AI Coach Card */}
        <GeminiCoachCard records={records} goals={goals} recommendation={primaryRecommendation} />

        {/* Detailed sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryBreakdownSection categoryDetails={summary.categoryDetails} totalCO2e={summary.totalCO2e} />
          <DailyTrendSection dailyBreakdown={summary.dailyBreakdown} />
        </div>
      </div>
    </Layout>
  );
}
