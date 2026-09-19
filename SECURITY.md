# Security and Data Integrity Policy

## 1. Storage & Persistence Limitations
- **LocalStorage**: Data (activities, goals, check-ins) is stored locally in the browser's `localStorage` under versioned payloads (`version: 1`).
- **Not Encrypted**: `localStorage` is **not secure encrypted server-side storage**. It is accessible to any script running in the browser origin.
- **No Authentication**: The application currently operates entirely client-side without user accounts or server-side access controls.

## 2. Input Validation & Data Integrity
- **Validation Boundary**: All user inputs (distance, dates, titles, targets) are validated at the domain and repository boundary before persistence or calculation.
- **Corrupted Data Resilience**: `StorageManager` wraps reads with JSON parsing safeguards and schema validation. Corrupted or malformed JSON payloads are safely handled without throwing uncaught exceptions or crashing the UI.
- **No Implicit Zeroes**: Missing inputs are explicitly handled and never silently conflated with zero.

## 3. Calculation Safety
- Deterministic carbon calculations reject negative numbers, `NaN`, and `Infinity` to prevent calculation failures.

## 4. XSS Safety
- User-controlled content is strictly rendered as text bindings in React. No unsafe HTML renderers (`dangerouslySetInnerHTML`, `eval`) are used.

## 5. Secrets Management
- No secret API keys or credentials are exposed in frontend source code. `VITE_*` environment variables are reserved for non-sensitive configuration only.
