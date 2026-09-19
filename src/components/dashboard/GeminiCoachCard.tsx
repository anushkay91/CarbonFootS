import React, { useState } from 'react';
import { Recommendation } from '../../services/RecommendationEngine';
import { CarbonGoal, ActivityRecord } from '../../types/domain';
import { TrackingSummaryEngine } from '../../services/TrackingSummaryEngine';
import { GoalAnalyticsEngine } from '../../services/GoalAnalyticsEngine';

interface GeminiCoachCardProps {
  records: ActivityRecord[];
  goals: CarbonGoal[];
  recommendation?: Recommendation;
}

export function GeminiCoachCard({ records, goals, recommendation }: GeminiCoachCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coachResult, setCoachResult] = useState<{
    summary: string;
    reason: string;
    action: string;
    limitations: string;
  } | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleAskCoach = async (promptOverride?: string) => {
    setIsOpen(true);
    setLoading(true);
    setError(null);

    const nowStr = new Date().toISOString().split('T')[0];
    const startStr = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const summary = TrackingSummaryEngine.getSummary(records, startStr, nowStr);
    const activeGoal = goals.find(g => g.status === 'active');
    const goalAnalysis = activeGoal ? GoalAnalyticsEngine.analyzeGoalProgress(activeGoal, records) : null;

    const context = {
      totalEstimatedCO2e: summary.totalCO2e,
      activityCount: summary.activityCount,
      largestSource: summary.largestSubtypeSource ? {
        activityType: summary.largestSubtypeSource.activityType,
        category: summary.largestSubtypeSource.category,
        estimatedCO2e: summary.largestSubtypeSource.totalCO2e
      } : undefined,
      activeGoal: activeGoal && goalAnalysis ? {
        title: activeGoal.title,
        targetValue: activeGoal.targetValue,
        currentValue: goalAnalysis.currentValue,
        unit: activeGoal.unit,
        cadence: activeGoal.cadence,
        isAchieved: goalAnalysis.isAchieved
      } : undefined,
      recommendation: recommendation ? {
        title: recommendation.title,
        action: recommendation.action,
        reasonText: recommendation.reasonText
      } : undefined
    };

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          userPrompt: promptOverride || customPrompt
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch AI coaching response.');
      }

      const data = await res.json();
      setCoachResult(data);
    } catch (err: any) {
      setError(err.message || 'Gemini coaching is currently unavailable. Using deterministic fallback.');
      setCoachResult({
        summary: `Based on your recorded activity for this period (${summary.totalCO2e.toFixed(1)} kg CO₂e total):`,
        reason: recommendation ? recommendation.reasonText : 'Your recorded activities establish your baseline emission pattern.',
        action: recommendation ? recommendation.action : 'Continue recording activities to refine your footprint tracking.',
        limitations: 'Deterministic fallback active (AI service unavailable).'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-lg shadow-sm space-y-4 border border-slate-700">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2.5 py-0.5 rounded-full">
          Carbon Coach (Gemini AI Powered)
        </span>
        <span className="text-xs text-slate-400">Optional Conversational Explanation</span>
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold">What is driving my footprint?</h3>
        <p className="text-sm text-slate-300">Get natural-language explanations of your calculated carbon facts, goals, and recommendations.</p>
      </div>

      {!isOpen ? (
        <div className="pt-2">
          <button
            onClick={() => handleAskCoach()}
            className="bg-sky-600 text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-sky-500 shadow-sm transition-colors inline-flex items-center space-x-2"
          >
            <span>Ask Carbon Coach</span>
            <span>&rarr;</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 pt-2 border-t border-slate-700/80">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Ask a question (e.g. Why is car highlighted?)"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={() => handleAskCoach(customPrompt)}
              disabled={loading}
              className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-50"
            >
              {loading ? 'Thinking...' : 'Ask'}
            </button>
          </div>

          {error && (
            <div className="bg-amber-950/60 border border-amber-800/60 text-amber-200 px-3 py-2 rounded text-xs">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-6 text-center text-slate-400 text-xs animate-pulse">
              Generating personalized explanation from your verified carbon facts...
            </div>
          ) : coachResult ? (
            <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-md space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">Summary</span>
                <p className="text-slate-200 mt-0.5">{coachResult.summary}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">Reasoning</span>
                <p className="text-slate-300 mt-0.5">{coachResult.reason}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Recommended Action</span>
                <p className="text-slate-200 mt-0.5 font-medium">{coachResult.action}</p>
              </div>
              <div className="pt-2 border-t border-slate-700 text-[10px] text-slate-400 italic">
                Limitations: {coachResult.limitations}
              </div>
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-xs underline"
            >
              Collapse Coach
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
