import { describe, it, expect } from "vitest";
import { pricing } from "../lib/pricing";

describe("Pricing Database", () => {
  it("should have valid pricing structure for all tools", () => {
    expect(Object.keys(pricing).length).toBeGreaterThan(0);
    
    for (const [toolId, config] of Object.entries(pricing)) {
      expect(config).toHaveProperty("category");
      expect(config).toHaveProperty("useCases");
      expect(config).toHaveProperty("plans");
      expect(Array.isArray(config.useCases)).toBe(true);
      expect(config.useCases.length).toBeGreaterThan(0);
      expect(Object.keys(config.plans).length).toBeGreaterThan(0);
    }
  });

  it("should return valid pricing for specific lookups", () => {
    // Cursor lookup
    const cursorPricing = pricing.cursor;
    expect(cursorPricing).toBeDefined();
    expect(cursorPricing.plans.pro.price).toBe(20);
    expect(cursorPricing.plans.pro.name).toBe("Pro");

    // ChatGPT lookup
    const chatGptPricing = pricing.chatgpt;
    expect(chatGptPricing).toBeDefined();
    expect(chatGptPricing.plans.plus.price).toBe(20);
  });

  it("should accurately list capabilities for plans", () => {
    const claudePro = pricing.claude.plans.pro;
    expect(claudePro.capabilities).toContain("Artifacts");
    expect(claudePro.capabilities.length).toBeGreaterThan(0);
  });

  it("should handle invalid pricing edge cases gracefully (by not defining them)", () => {
    // Ensuring non-existent tools or plans return undefined (standard object behavior)
    // @ts-expect-error Testing invalid lookup
    const invalidTool = pricing.non_existent_tool;
    expect(invalidTool).toBeUndefined();

    const validToolInvalidPlan = pricing.cursor.plans.enterprise_custom;
    expect(validToolInvalidPlan).toBeUndefined();
  });

  it("should maintain tool configuration consistency for recommended team sizes", () => {
    for (const [toolId, config] of Object.entries(pricing)) {
      for (const [planId, plan] of Object.entries(config.plans)) {
        // recommendedTeamSize should be an array of 1 or 2 numbers
        expect(Array.isArray(plan.recommendedTeamSize)).toBe(true);
        expect(plan.recommendedTeamSize.length).toBeGreaterThanOrEqual(1);
        expect(plan.recommendedTeamSize.length).toBeLessThanOrEqual(2);
        
        // Min size should be >= 1
        expect(plan.recommendedTeamSize[0]).toBeGreaterThanOrEqual(1);
        
        // If there's a max size, it should be >= min size
        if (plan.recommendedTeamSize.length === 2) {
          expect(plan.recommendedTeamSize[1]).toBeGreaterThanOrEqual(plan.recommendedTeamSize[0]);
        }
      }
    }
  });
});
