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
        <div className="bg-gradient-to-r from-sky-50 to-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Verified Impact Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Personal Carbon Dashboard</h1>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">Review your estimated footprint, track reduction goals, and explore scenarios.</p>
        </div>
        <EmptyState />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-r from-sky-50 to-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Verified Impact Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Personal Carbon Dashboard</h1>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">Review your estimated footprint, track reduction goals, and explore deterministic what-if scenarios.</p>
        </div>
        <div className="flex-shrink-0">
          <PeriodSelector selectedDays={days} onSelectDays={setDays} />
        </div>
      </div>

      <div className="space-y-8">
        {/* Zone 1: Overview & Hero Metrics */}
        <section aria-labelledby="overview-heading" className="space-y-4">
          <h2 id="overview-heading" className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Current Footprint & Context</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FootprintSummaryCard totalCO2e={summary.totalCO2e} activityCount={summary.activityCount} />
            <CoverageCard recordedDays={summary.coverageDays} periodDays={summary.periodDays} hasData={summary.hasData} />
            <ComparisonCard comparison={summary.comparison} />
            <LargestSourceCard largestSource={summary.largestReportedSource} categoryTotals={summary.categoryTotals} />
          </div>
        </section>

        {/* Zone 2: Understand (Categories & Trend) */}
        <section aria-labelledby="understand-heading" className="space-y-4">
          <h2 id="understand-heading" className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Analytics & Trend Breakdown</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryBreakdownSection categoryDetails={summary.categoryDetails} totalCO2e={summary.totalCO2e} />
            <DailyTrendSection dailyBreakdown={summary.dailyBreakdown} />
          </div>
        </section>

        {/* Zone 3: Act (Goals & Recommendations) */}
        <section aria-labelledby="act-heading" className="space-y-4">
          <h2 id="act-heading" className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Goals & Evidence-Based Actions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeGoal && (
              <ActiveGoalSummaryCard goal={activeGoal} records={records} />
            )}
            <RecommendationCard recommendation={primaryRecommendation} records={records} activeGoal={activeGoal} />
          </div>
        </section>

        {/* Zone 4: Explore & Explain (Gemini Coach) */}
        <section aria-labelledby="explore-heading" className="space-y-4">
          <h2 id="explore-heading" className="text-xs font-bold uppercase tracking-wider text-slate-400">4. AI Explanation & Guidance</h2>
          <GeminiCoachCard records={records} goals={goals} recommendation={primaryRecommendation} />
        </section>
      </div>
    </Layout>
  );
}
