import { describe, it, expect } from "vitest";
import { auditTool, aggregateAudit } from "../lib/audit-engine";
import { ToolInput } from "../types/audit";

describe("Audit Engine - Deterministic Rules", () => {
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

  it("3. API overspend detection - Suggests standard plans when API cost is high", () => {
    const input: ToolInput = {
      id: "3",
      toolId: "claude",
      planId: "api",
      monthlySpend: 100, // Very high API spend for 1 user
      seats: 1,
    };
    
    // Create a mock pricing db where 'api' isn't explicitly defined but rule catches it
    const result = auditTool(input, [input]);
    
    // The rule in optimization-rules looks for "api"
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].optimizationType).toBe("api-overspend");
    // Standard Pro is 20, 100 - 20 = 80 savings
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
      // 50 users on Enterprise = 39 * 50 = 1950. 
      // But Enterprise min seats is 50. Wait, Enterprise is valid for 50 users. 
      // Let's use a large overlapping tool to generate massive savings.
      { id: "2", toolId: "cursor", planId: "business", monthlySpend: 2000, seats: 50 },
    ];
    
    // Cursor vs Copilot overlap. Copilot will be flagged to consolidate since Cursor (c) < Copilot (g)
    const summary = aggregateAudit(inputs);
    
    expect(summary.totalMonthlySavings).toBeGreaterThan(500);
    expect(summary.hasHighSavingsOpportunity).toBe(true);
  });

  it("10. Cross-tool recommendations - Suggests cheaper alternatives in same category", () => {
    const input: ToolInput = {
      id: "1",
      toolId: "claude",
      planId: "pro",
      monthlySpend: 20,
      seats: 1,
    };
    
    // To trigger cross-tool, we need a cheaper tool in the same category.
    // claude category is "general-chat". chatgpt free is 0. 
    const result = auditTool(input, [input]);
    
    expect(result.recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ optimizationType: "cross-tool" })
      ])
    );
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
});
