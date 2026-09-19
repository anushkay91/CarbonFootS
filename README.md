# CarbonFootS — Personal Carbon-Action Tracker

CarbonFootS is a personal carbon-action product built around:
**Measure → Identify → Recommend → Commit → Track → Learn → Improve**

## Overview
CarbonFootS helps users record, estimate, and track their everyday carbon footprint across categories such as Transportation and Electricity. It provides deterministic carbon calculations, transparent emission factor metadata, tracking summaries, and goal check-ins.

## Implemented Features
1. **Activity Recording & CRUD**: Create, view, edit, filter, sort, and delete supported carbon activities with robust validation.
2. **Deterministic Carbon Calculations**: Powered by a canonical emission factor dataset (`EMISSION_FACTORS`) with versioning, units, sources, and assumptions.
3. **Tracking & Dashboard**: Single-pass aggregation via `TrackingSummaryEngine` providing total emissions, category breakdowns, daily trends, coverage, and period comparisons (7, 30, 90 days).
4. **Goals & Check-Ins**: Create carbon-reduction goals, log periodic check-ins, and track progress over time.
5. **Security & Data Integrity**: Versioned localStorage payloads (`version: 1`), safe JSON parsing with automated backup of corrupted states, and strict domain validation.
6. **Accessibility & Inclusive UX**: Semantic HTML landmarks, keyboard navigation, focus visibility, skip-to-content navigation, form labeling, and screen reader text alternatives for charts.
7. **Factor Transparency & Methodology**: Dedicated methodology page and activity detail breakdowns detailing inputs, emission factors, units, sources, and data-quality explanations.

## Technical Architecture
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router.
- **Backend/Full-Stack**: Express server with Vite middleware / production bundle support.
- **Testing**: Vitest unit and integration test suites.

## Known Limitations
- Data is stored client-side in browser `localStorage` and does not synchronize across devices or user accounts.
- Carbon figures are scientific estimates based on standardized emission factors and user-reported inputs rather than direct sensor telemetry.
- Supported categories are limited to documented emission factors (Transportation and Electricity).

## Future Work
- Cloud database synchronization and multi-user authentication.
- Integration with external environmental tracking APIs.
