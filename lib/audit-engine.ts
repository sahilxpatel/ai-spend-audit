import { ToolInput, AuditResult, AuditSummary, ToolPricing } from "@/types/audit";
import { generateRecommendations } from "./optimization-rules";
import { pricing as defaultPricingDb } from "./pricing";

/**
 * Audits a single tool and returns recommendations and savings.
 */
export function auditTool(
  input: ToolInput,
  allInputs: ToolInput[],
  pricingDb: Record<string, ToolPricing> = defaultPricingDb
): AuditResult {
  const isInStack = allInputs.some(
    entry => entry.id === input.id && entry.toolId === input.toolId
  );
  const recommendations = isInStack
    ? generateRecommendations(input, allInputs, pricingDb)
    : [];
  
  const currentSpend = input.monthlySpend;
  
  // Potential savings is the maximum of any single recommendation
  // (You can't stack a cancellation with a downgrade, you do one or the other)
  const potentialSavings = recommendations.reduce(
    (max, rec) => Math.max(max, rec.monthlySavings),
    0
  );
  
  const optimalSpend = Math.max(0, currentSpend - potentialSavings);

  return {
    toolId: input.toolId,
    planId: input.planId,
    currentSpend,
    optimalSpend,
    potentialSavings,
    recommendations,
  };
}

/**
 * Combines all tool audits, calculates totals, and determines optimization level.
 */
export function aggregateAudit(
  inputs: ToolInput[],
  pricingDb: Record<string, ToolPricing> = defaultPricingDb
): AuditSummary {
  const results = inputs.map(input => auditTool(input, inputs, pricingDb));
  
  const totalCurrentSpend = results.reduce((sum, res) => sum + res.currentSpend, 0);
  
  // Total savings is the sum of max savings per tool
  const totalMonthlySavings = results.reduce((sum, res) => sum + res.potentialSavings, 0);
  
  const totalRecommendedSpend = Math.max(0, totalCurrentSpend - totalMonthlySavings);
  const totalAnnualSavings = totalMonthlySavings * 12;
  
  const savingsPercentage = totalCurrentSpend > 0 ? (totalMonthlySavings / totalCurrentSpend) * 100 : 0;
  
  // Optimization Score out of 100. Lower savings % means higher score (more optimized)
  const optimizationScore = Math.max(0, Math.min(100, Math.round(100 - savingsPercentage)));
  
  const hasHighSavingsOpportunity = totalMonthlySavings > 500;
  
  // Global team size is max seats across any tool
  const globalTeamSize = inputs.reduce((max, input) => Math.max(max, input.seats), 0);
  
  // Primary use case based on highest representation
  const useCaseCounts: Record<string, number> = {};
  inputs.forEach(input => {
    const toolPricing = pricingDb[input.toolId];
    if (toolPricing) {
      toolPricing.useCases.forEach(uc => {
        useCaseCounts[uc] = (useCaseCounts[uc] || 0) + 1;
      });
    }
  });
  
  let primaryUseCase: import("@/types/audit").UseCaseType = "general-chat"; // default
  let maxCount = 0;
  for (const [uc, count] of Object.entries(useCaseCounts)) {
    if (count > maxCount) {
      maxCount = count;
      primaryUseCase = uc as import("@/types/audit").UseCaseType;
    }
  }

  return {
    totalCurrentSpend,
    totalRecommendedSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsPercentage,
    optimizationScore,
    hasHighSavingsOpportunity,
    results,
    globalTeamSize,
    primaryUseCase,
  };
}
