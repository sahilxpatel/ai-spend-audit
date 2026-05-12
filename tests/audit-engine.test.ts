import { describe, it, expect } from "vitest";
import { auditTool, aggregateAudit } from "../lib/audit-engine";
import {
  checkCrossToolOptimization,
  checkPlanOverkill,
  checkApiOverspend,
} from "../lib/optimization-rules";
import { ToolInput } from "../types/audit";
import { pricing } from "../lib/pricing";

describe("Audit Engine - Deterministic Rules", () => {
  // ─── CORE RULE TESTS ────────────────────────────────────────────────────────

  it("1. Team plan overkill - Downgrades small teams on expensive plans", () => {
    const input: ToolInput = {
      id: "1",
      toolId: "chatgpt",
      planId: "team",
      monthlySpend: 60,
      seats: 2,
    };

    const result = auditTool(input, [input]);

    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].optimizationType).toBe("plan-overkill");
    expect(result.recommendations[0].monthlySavings).toBe(20); // 60 - (20 * 2) = 20
    expect(result.recommendations[0].annualSavings).toBe(240);
  });

  it("2. Enterprise downgrade logic - Flags large plans for small teams", () => {
    const input: ToolInput = {
      id: "2",
      toolId: "github_copilot",
      planId: "enterprise",
      monthlySpend: 390,
      seats: 10,
    };

    const result = auditTool(input, [input]);

    expect(result.recommendations.some(r => r.optimizationType === "plan-overkill")).toBe(true);
    expect(result.recommendations[0].optimizationType).toBe("plan-overkill");
    // Downgrades to Business which is $19/mo for 10 users = $190
    expect(result.recommendations[0].monthlySavings).toBe(200); // 390 - 190 = 200
  });

  it("3. API overspend detection - Suggests subscription plans when API cost is high", () => {
    const input: ToolInput = {
      id: "3",
      toolId: "claude",
      planId: "api",
      monthlySpend: 100, // Very high API spend for 1 user
      seats: 1,
    };

    const result = auditTool(input, [input]);

    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].optimizationType).toBe("api-overspend");
    // claude Pro is $20. 100 - 20 = 80 savings
    expect(result.recommendations[0].monthlySavings).toBe(80);
  });

  it("4. Overlapping tools detection - Identifies redundant category tools", () => {
    const inputs: ToolInput[] = [
      { id: "1", toolId: "cursor", planId: "pro", monthlySpend: 200, seats: 10 },
      { id: "2", toolId: "github_copilot", planId: "business", monthlySpend: 190, seats: 10 },
    ];

    // Cursor is 'cursor' (c), GitHub Copilot is 'github_copilot' (g).
    // Seats are equal. Alphabetically 'cursor' < 'github_copilot', so cursor is primary.
    const resultCopilot = auditTool(inputs[1], inputs);

    expect(resultCopilot.recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ optimizationType: "overlapping-tools" })
      ])
    );
    expect(resultCopilot.potentialSavings).toBe(190);
  });

  it("5 & 6. Correct monthly and annual savings calculation", () => {
    const input: ToolInput = {
      id: "1",
      toolId: "chatgpt",
      planId: "team",
      monthlySpend: 60,
      seats: 2,
    };

    const result = auditTool(input, [input]);

    expect(result.potentialSavings).toBe(20);
    expect(result.optimalSpend).toBe(40);
    expect(result.recommendations[0].annualSavings).toBe(240);
  });

  it("7. No-savings scenarios - Perfect setup yields no recommendations", () => {
    const input: ToolInput = {
      id: "1",
      toolId: "cursor",
      planId: "hobby",
      monthlySpend: 0,
      seats: 1,
    };

    const result = auditTool(input, [input]);

    expect(result.recommendations).toHaveLength(0);
    expect(result.currentSpend).toBe(0);
    expect(result.optimalSpend).toBe(0);
  });

  it("8. Aggregation logic - Calculates totals across multiple tools", () => {
    const inputs: ToolInput[] = [
      { id: "1", toolId: "chatgpt", planId: "team", monthlySpend: 60, seats: 2 }, // Saves 20
      { id: "2", toolId: "cursor", planId: "hobby", monthlySpend: 0, seats: 1 },   // Perfect, saves 0
    ];

    const summary = aggregateAudit(inputs);

    expect(summary.totalCurrentSpend).toBe(60);
    expect(summary.totalMonthlySavings).toBe(20);
    expect(summary.totalRecommendedSpend).toBe(40);
    expect(summary.totalAnnualSavings).toBe(240);
    expect(summary.savingsPercentage).toBeCloseTo(33.33, 1);
    expect(summary.optimizationScore).toBe(67); // 100 - 33
  });

  it("9. High-savings detection - Sets flag when savings exceed 500", () => {
    const inputs: ToolInput[] = [
      { id: "1", toolId: "github_copilot", planId: "enterprise", monthlySpend: 1950, seats: 50 },
      { id: "2", toolId: "cursor", planId: "business", monthlySpend: 2000, seats: 50 },
    ];

    // Cursor vs Copilot overlap. Copilot will be flagged to consolidate since Cursor (c) < Copilot (g)
    const summary = aggregateAudit(inputs);

    expect(summary.totalMonthlySavings).toBeGreaterThan(500);
    expect(summary.hasHighSavingsOpportunity).toBe(true);
  });

  it("Credit opportunity rule triggers at >= 200 spend", () => {
    const input: ToolInput = {
      id: "1",
      toolId: "cursor",
      planId: "business",
      monthlySpend: 400,
      seats: 10,
    };

    const result = auditTool(input, [input]);

    expect(result.recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ optimizationType: "credit-opportunity" })
      ])
    );
  });

  // ─── BUG FIX: CROSS-TOOL STACK ISOLATION TESTS ──────────────────────────────

  it("10. Cross-tool only fires when the alternative tool IS in the user's stack", () => {
    // Both Claude and Gemini are in the stack — cross-tool comparison is valid.
    const inputs: ToolInput[] = [
      { id: "1", toolId: "claude", planId: "pro", monthlySpend: 30, seats: 1 },
      { id: "2", toolId: "gemini", planId: "advanced", monthlySpend: 19.99, seats: 1 },
    ];

    // Claude ($20/mo) vs Gemini Advanced ($19.99/mo): Gemini is cheaper but only by $0.01
    // This may or may not fire depending on the 1-seat seat range check.
    // The key assertion: the result should NOT reference tools outside the two-item stack.
    const result = auditTool(inputs[0], inputs);
    const crossToolRecs = result.recommendations.filter(r => r.optimizationType === "cross-tool");

    crossToolRecs.forEach(rec => {
      // Each cross-tool title must reference a tool in the user's active stack
      const mentionedToolId = inputs.find(i =>
        rec.title.toLowerCase().includes(i.toolId.split("_").join(" ").toLowerCase())
      );
      expect(mentionedToolId).toBeDefined();
    });
    // Validate the guard itself: with only one active tool, cross-tool should never fire
    const crossCheck = checkCrossToolOptimization(
      inputs[0],
      pricing["claude"],
      pricing,
      new Set(["claude"])
    );
    expect(crossCheck).toBeNull();
  });

  it("11. Single-tool audit (Cursor Hobby) produces zero recommendations", () => {
    const input: ToolInput = {
      id: "1",
      toolId: "cursor",
      planId: "hobby",
      monthlySpend: 0,
      seats: 1,
    };

    const result = auditTool(input, [input]);

    // No cross-tool, no downgrade, no overlap, no API, no credits ($0 spend)
    expect(result.recommendations).toHaveLength(0);
    expect(result.potentialSavings).toBe(0);
  });

  it("12. Claude-only audit does NOT generate Copilot or GitHub recommendations", () => {
    const input: ToolInput = {
      id: "1",
      toolId: "claude",
      planId: "pro",
      monthlySpend: 20,
      seats: 1,
    };

    // Only Claude in stack — cross-tool must never reference other tools
    const result = auditTool(input, [input]);

    const invalidRecs = result.recommendations.filter(
      r => r.title.toLowerCase().includes("copilot") ||
           r.title.toLowerCase().includes("github") ||
           r.title.toLowerCase().includes("chatgpt") ||
           r.title.toLowerCase().includes("gemini")
    );
    expect(invalidRecs).toHaveLength(0);
  });

  it("13. Zero-spend plans do NOT trigger downgrade recommendations", () => {
    // ChatGPT Team with 2 seats but $0 reported spend — team size technically warrants downgrade,
    // but there are no real dollars to save.
    const input: ToolInput = {
      id: "1",
      toolId: "chatgpt",
      planId: "team",
      monthlySpend: 0,
      seats: 2,
    };

    const result = auditTool(input, [input]);

    const downgradeRecs = result.recommendations.filter(r => r.optimizationType === "plan-overkill");
    expect(downgradeRecs).toHaveLength(0);
    // No savings possible from $0 spend
    expect(result.potentialSavings).toBe(0);
  });

  it("14. Zero-spend API plan does NOT trigger api-overspend recommendation", () => {
    const input: ToolInput = {
      id: "1",
      toolId: "claude",
      planId: "api",
      monthlySpend: 0,
      seats: 1,
    };

    const result = auditTool(input, [input]);

    const apiRecs = result.recommendations.filter(r => r.optimizationType === "api-overspend");
    expect(apiRecs).toHaveLength(0);
  });

  it("15. checkPlanOverkill returns null for zero-spend inputs", () => {
    const input: ToolInput = {
      id: "1",
      toolId: "chatgpt",
      planId: "team",
      monthlySpend: 0,
      seats: 1,
    };
    const result = checkPlanOverkill(input, pricing["chatgpt"]);
    expect(result).toBeNull();
  });

  it("16. checkApiOverspend returns null for zero-spend inputs", () => {
    const input: ToolInput = {
      id: "1",
      toolId: "claude",
      planId: "api",
      monthlySpend: 0,
      seats: 1,
    };
    const result = checkApiOverspend(input, pricing["claude"]);
    expect(result).toBeNull();
  });

  it("17. checkCrossToolOptimization returns null when activeToolIds is empty", () => {
    const input: ToolInput = {
      id: "1",
      toolId: "cursor",
      planId: "pro",
      monthlySpend: 20,
      seats: 1,
    };
    const emptyStack = new Set<string>();
    const result = checkCrossToolOptimization(input, pricing["cursor"], pricing, emptyStack);
    expect(result).toBeNull();
  });

  it("18. Cursor-only input never generates ChatGPT recommendations", () => {
    const input: ToolInput = {
      id: "1",
      toolId: "cursor",
      planId: "hobby",
      monthlySpend: 0,
      seats: 1,
    };

    const summary = aggregateAudit([input]);

    summary.results.forEach(res => {
      res.recommendations.forEach(rec => {
        expect(rec.title.toLowerCase()).not.toContain("chatgpt");
        expect(rec.title.toLowerCase()).not.toContain("openai");
        expect(rec.title.toLowerCase()).not.toContain("claude");
        expect(rec.title.toLowerCase()).not.toContain("copilot");
      });
    });
  });

  it("19. 'Already optimized' state: zero savings when single cheap tool is properly used", () => {
    const input: ToolInput = {
      id: "1",
      toolId: "cursor",
      planId: "pro",
      monthlySpend: 20,
      seats: 1,
    };

    const summary = aggregateAudit([input]);

    // Pro at $20 for 1 seat is the correct plan — only credit ($200+ threshold) or cross-tool could fire.
    // $20 spend is below the credit threshold. Cross-tool requires another tool in stack.
    expect(summary.totalMonthlySavings).toBe(0);
    expect(summary.optimizationScore).toBe(100);
    const allRecs = summary.results.flatMap(r => r.recommendations);
    expect(allRecs).toHaveLength(0);
  });
});
