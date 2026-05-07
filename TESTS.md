# Automated Tests Documentation

This file documents the automated test suite for the deterministic audit engine.

## Test Runner
We use **Vitest** for testing the core TypeScript business logic.

**How to run tests:**
```bash
npm run test
```

## Test Files

### 1. `lib/__tests__/audit-engine.test.ts`
This is the primary test file for the financial logic. It must contain at least 5 robust test cases.

**Test Cases (To be implemented):**
1. `should detect single-user team plan overspend`
   - *Logic:* If a user selects a Team plan (e.g., Claude Team at $150/mo minimum) but has only 1 seat, the engine must flag this as an overspend and recommend downgrading to Pro ($20/mo).
2. `should detect redundant coding assistants`
   - *Logic:* If a user has both Cursor Pro and GitHub Copilot, it should suggest consolidating to just one based on their primary use case.
3. `should correctly aggregate cross-tool savings`
   - *Logic:* Ensure the total monthly and annual savings math is perfectly accurate across an array of 4+ tools.
4. `should handle zero-spend hobby plans gracefully`
   - *Logic:* If the user is on free tiers, savings should be 0, and the recommendation should be to maintain the current stack or upgrade if team size dictates it.
5. `should recommend API usage over subscriptions for light users`
   - *Logic:* If use case is "mixed" but spend is very high on individual subscriptions, suggest using Groq or OpenAI APIs for occasional queries instead of seat-based licenses.
