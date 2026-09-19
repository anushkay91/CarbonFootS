# CarbonFootS — Personal Carbon-Action Tracker

CarbonFootS is a personal carbon-action product built around the continuous loop:
**Measure → Identify → Recommend → Commit → Track → Learn → Improve**

## 1. Product & Problem Statement
People who want to reduce their carbon footprint need a simple, transparent, and trustworthy way to understand which everyday activities contribute most to their emissions, how reliable those estimates are, and what realistic goals they can track over time. CarbonFootS provides a deterministic, explainable carbon tracking platform without opaque AI black-boxes or unsupported scientific claims.

## 2. Core Workflow
```text
Measure (Record Activity)
   ↓
Identify (Dashboard & Category Breakdown)
   ↓
Commit (Create Carbon-Reduction Goals)
   ↓
Track (Log Check-ins & Monitor Progress)
   ↓
Learn & Improve (Methodology Transparency & Historical Analysis)
```

## 3. Quick Start & Setup Guide
### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation & Execution
```bash
# 1. Clone repository
git clone https://github.com/anushkay91/CarbonFootS.git
cd CarbonFootS

# 2. Install dependencies
npm install

# 3. Configure environment (no secret API keys required for core client functionality)
cp .env.example .env

# 4. Start development server
npm run dev
```

### Verification & Testing Commands
```bash
# Run typechecking
npm run typecheck

# Run linter
npm run lint

# Run test suite
npm test run

# Build application for production
npm run build
```

## 4. Architecture Documentation
```text
React 18 UI (Pages, Components, Responsive Tailwind)
                     ↓
Application / Repository Layer (ActivityRepository, GoalRepository)
                     ↓
Domain Models & Validation (Input validation, StorageManager persistence)
                     ↓
Carbon Calculation & Tracking Logic (CarbonCalculator, TrackingSummaryEngine)
                     ↓
Client Persistence (Browser localStorage with versioning & corruption recovery)
```

## 5. Carbon Calculation & Transparency
- **Deterministic Formula**: `User Input Quantity × Emission Factor Value = Estimated CO₂e`
- **Emission Factors Dataset**: Canonical versioned factors (`EMISSION_FACTORS`) defining units, factor IDs, source citations, and reference years.
- **Data Quality**: Categorized as High, Medium, or Low based on whether inputs derive from direct measurements, bills, or standard averages.
- **Assumptions**: Explicitly documented assumptions for every supported activity calculation.

## 6. Privacy & Data Handling
- **Client-Side Storage**: All activity records, goals, and check-ins are stored locally in the browser's `localStorage` via a versioned storage manager (`version: 1`).
- **No Backend Persistence**: There is no database or cloud server storing user personal data in the default deployment. Data never leaves the browser unless explicitly exported or synchronized via future integrations.
- **Security**: Strict input validation and sanitization prevent malformed payloads or invalid numbers from corrupting application state.

## 7. Testing Documentation
Test suites are powered by **Vitest** and cover:
- **Calculation Accuracy**: Deterministic outputs, factor consistency, and unit handling.
- **Repository CRUD**: Creation, reading, updating, deleting, and storage persistence.
- **Integration Journeys**: E2E data flow from activity creation through summary aggregation and dashboard rendering.
- **Security & Data Integrity**: Handling corrupted JSON in localStorage, schema versioning, and input sanitization.
- **Accessibility**: Semantic landmarks and keyboard navigability.

## 8. Demonstration Path & Demo Script
1. **Start at Dashboard**: Review overall estimated CO₂e, category breakdown, and period comparison (7, 30, 90 days).
2. **Add Activity**: Record a supported activity (e.g., 50 km petrol car travel).
3. **Inspect Detail**: View the calculation breakdown, emission factor ID, version, source, and assumptions.
4. **History & Editing**: Edit the activity input and observe deterministic recalculation.
5. **Goals & Check-ins**: Create a carbon-reduction goal, log a check-in, and track progress persistence across reloads.

## 9. Feature-to-Implementation Matrix

| Capability | Status | Evidence / Location |
|---|---|---|
| Activity recording & CRUD | Implemented | `src/pages/AddActivityPage.tsx`, `ActivitiesPage.tsx` |
| Deterministic carbon calculation | Implemented | `src/services/carbonCalculator.ts` |
| Emission factor transparency | Implemented | `src/pages/MethodologyPage.tsx`, `ActivityDetailPage.tsx` |
| Dashboard aggregation | Implemented | `src/services/TrackingSummaryEngine.ts`, `Dashboard.tsx` |
| Goals & check-ins | Implemented | `src/pages/GoalsPage.tsx`, `GoalDetailPage.tsx` |
| Versioned storage & validation | Implemented | `src/services/StorageManager.ts`, `validation.ts` |
| Accessibility & keyboard support | Implemented | `src/components/Layout.tsx`, semantic HTML |
| Automated test suite | Implemented | `src/tests/` (8 test files, 33 tests) |

## 10. Known Limitations
- Data is stored client-side in browser `localStorage` and is tied to the specific browser profile.
- Carbon figures are scientific estimates based on standardized emission factors and user-reported inputs rather than real-time sensor telemetry.
- Supported categories are limited to documented emission factors (Transportation and Electricity).

