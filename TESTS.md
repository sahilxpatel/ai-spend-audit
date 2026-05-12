# Automated Tests Documentation

This file documents the automated test suite for the deterministic audit engine.

## Test Runner
We use **Vitest** for testing the core TypeScript business logic and ensuring financial math is completely robust.

**How to run tests:**
```bash
npm run test
```

## Test Coverage

### 1. Pricing Engine Validation (`tests/pricing.test.ts`)
Ensures the pricing database (`lib/pricing.ts`) is structurally sound.
- Verifies all tools have properly defined structures (categories, use cases, plans).
- Ensures valid pricing lookups (e.g., Cursor Pro = $20, ChatGPT Plus = $20).
- Validates capability arrays.
- Validates team size recommendations (min and max bounds) for enterprise vs. individual plans.

### 2. Audit Rules & Aggregation (`tests/audit-engine.test.ts`)
Thoroughly tests the `lib/audit-engine.ts` deterministic logic against various edge cases. Currently tests 11 robust scenarios:

1. **Team plan overkill**: Downgrades small teams overpaying on expensive enterprise/team tiers (e.g., 2 users on a plan meant for 5+).
2. **Enterprise downgrade logic**: Flags large plans for small teams (e.g., GitHub Copilot Enterprise vs. Business).
3. **API overspend detection**: Suggests standard UI plans when raw API cost is excessively high for a single user.
4. **Overlapping tools detection**: Identifies redundant tools in the same category (e.g., Cursor and GitHub Copilot) and suggests consolidating to one.
5. **Accurate math calculation**: Validates that monthly savings multiplied out accurately reflect annual savings.
6. **No-savings scenarios**: Ensures perfectly optimized setups yield zero recommendations and no false flags.
7. **Cross-tool recommendations**: Suggests cheaper alternatives in the same category if available.
8. **Aggregation logic**: Calculates total optimization scores and percentages perfectly across an entire stack.
9. **High-savings detection**: Correctly sets flags if the user has >$500 in monthly savings (triggers the premium "Book Consultation" CTA).
10. **Credit opportunity rule**: Recommends looking for startup credits if monthly spend exceeds $200 for a specific tool.
