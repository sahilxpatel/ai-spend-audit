import { ToolInput, AuditRecommendation, ToolPricing } from "@/types/audit";

function formatToolName(toolId: string): string {
  return toolId.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// RULE TYPE 1 & 4 — Plan Overkill & Same-Vendor Optimization
export function checkPlanOverkill(
  input: ToolInput,
  toolPricing: ToolPricing
): AuditRecommendation | null {
  const plan = toolPricing.plans[input.planId];
  if (!plan) return null;

  // Check if seats are below the minimum recommended for the current plan
  if (plan.recommendedTeamSize[0] > input.seats) {
    let bestPlanId: string | null = null;
    let bestPlanPrice = Infinity;

    for (const [pId, pInfo] of Object.entries(toolPricing.plans)) {
      const minSeats = pInfo.recommendedTeamSize[0];
      const maxSeats = pInfo.recommendedTeamSize.length > 1 ? (pInfo.recommendedTeamSize[1] ?? minSeats) : minSeats;
      
      if (input.seats >= minSeats && input.seats <= maxSeats && pInfo.price < plan.price) {
        if (pInfo.price < bestPlanPrice) {
          bestPlanPrice = pInfo.price;
          bestPlanId = pId;
        }
      }
    }

    if (bestPlanId) {
      const betterPlan = toolPricing.plans[bestPlanId];
      const optimalMonthly = betterPlan.price * input.seats;
      const monthlySavings = Math.max(0, input.monthlySpend - optimalMonthly);

      return {
        title: `Downgrade to ${formatToolName(input.toolId)} ${betterPlan.name}`,
        description: `Team size (${input.seats}) does not require ${plan.name} features.`,
        reasoning: `The ${plan.name} plan is designed for ${plan.recommendedTeamSize[0]}+ users. Downgrading to ${betterPlan.name} keeps core capabilities while reducing cost.`,
        monthlySavings,
        annualSavings: monthlySavings * 12,
        confidence: "high",
        optimizationType: "plan-overkill",
        severity: monthlySavings > 100 ? "high" : "medium"
      };
    }
  }
  return null;
}

// RULE TYPE 2 — Expensive API Usage
export function checkApiOverspend(
  input: ToolInput,
  toolPricing: ToolPricing
): AuditRecommendation | null {
  // Assuming 'api' is passed as a planId for API usage
  if (input.planId.toLowerCase() === "api") {
    // Find a standard pro/plus plan to compare against (usually around $20)
    const standardPlanEntry = Object.entries(toolPricing.plans).find(
      ([id, p]) => id.includes("pro") || id.includes("plus") || p.price === 20
    );

    if (standardPlanEntry) {
      const [, standardPlan] = standardPlanEntry;
      const optimalSpend = standardPlan.price * input.seats;
      
      if (input.monthlySpend > optimalSpend * 1.2) { // 20% more than subscription
        const monthlySavings = input.monthlySpend - optimalSpend;
        return {
          title: `Switch from API to ${standardPlan.name} Subscription`,
          description: `API spend is significantly higher than fixed subscription costs.`,
          reasoning: `You are spending $${input.monthlySpend}/mo on API usage for ${input.seats} users. A fixed ${standardPlan.name} subscription would cost $${optimalSpend}/mo.`,
          monthlySavings,
          annualSavings: monthlySavings * 12,
          confidence: "medium",
          optimizationType: "api-overspend",
          severity: monthlySavings > 50 ? "high" : "medium"
        };
      }
    }
  }
  return null;
}

// RULE TYPE 3 — Overlapping Tools
export function checkOverlappingTools(
  input: ToolInput,
  allInputs: ToolInput[],
  pricingDb: Record<string, ToolPricing>
): AuditRecommendation | null {
  const toolPricing = pricingDb[input.toolId];
  if (!toolPricing || input.planId === "api") return null;

  const overlaps = allInputs.filter(other => {
    if (other.id === input.id) return false;
    const otherPricing = pricingDb[other.toolId];
    if (!otherPricing) return false;
    return otherPricing.category === toolPricing.category;
  });

  if (overlaps.length === 0) return null;

  // Determine the "primary" tool in this category based on highest seats, break ties alphabetically
  let primaryTool = input;
  for (const other of overlaps) {
    if (other.seats > primaryTool.seats) {
      primaryTool = other;
    } else if (other.seats === primaryTool.seats && other.toolId < primaryTool.toolId) {
      primaryTool = other;
    }
  }

  // If this tool is not the primary one, recommend cancelling it
  if (primaryTool.id !== input.id) {
    return {
      title: `Consolidate ${formatToolName(input.toolId)}`,
      description: `Redundant tool in the '${toolPricing.category}' category.`,
      reasoning: `You are also using ${formatToolName(primaryTool.toolId)} for ${toolPricing.category}. Consolidating to a single tool reduces context switching and redundant spend.`,
      monthlySavings: input.monthlySpend,
      annualSavings: input.monthlySpend * 12,
      confidence: "medium",
      optimizationType: "overlapping-tools",
      severity: input.monthlySpend > 50 ? "high" : "medium"
    };
  }

  return null;
}

// RULE TYPE 5 — Cross-Tool Recommendations
export function checkCrossToolOptimization(
  input: ToolInput,
  toolPricing: ToolPricing,
  pricingDb: Record<string, ToolPricing>
): AuditRecommendation | null {
  const currentPlan = toolPricing.plans[input.planId];
  if (!currentPlan) return null;

  let alternativeToolId: string | null = null;
  let alternativePlanId: string | null = null;
  let lowestPrice = currentPlan.price;

  // Look for cheaper alternatives in the same category
  for (const [tId, tPricing] of Object.entries(pricingDb)) {
    if (tId === input.toolId || tPricing.category !== toolPricing.category) continue;
    
    for (const [pId, pInfo] of Object.entries(tPricing.plans)) {
      const minSeats = pInfo.recommendedTeamSize[0];
      const maxSeats = pInfo.recommendedTeamSize.length > 1 ? (pInfo.recommendedTeamSize[1] ?? minSeats) : minSeats;
      
      // Ensure the alternative supports the team size and is cheaper
      if (input.seats >= minSeats && input.seats <= maxSeats && pInfo.price < lowestPrice) {
        lowestPrice = pInfo.price;
        alternativeToolId = tId;
        alternativePlanId = pId;
      }
    }
  }

  if (alternativeToolId && alternativePlanId) {
    const altPricing = pricingDb[alternativeToolId];
    const altPlan = altPricing.plans[alternativePlanId];
    const optimalMonthly = altPlan.price * input.seats;
    const monthlySavings = Math.max(0, input.monthlySpend - optimalMonthly);

    if (monthlySavings > 0) {
      return {
        title: `Switch to ${formatToolName(alternativeToolId)} ${altPlan.name}`,
        description: `Lower-cost alternative available for ${toolPricing.category}.`,
        reasoning: `${formatToolName(alternativeToolId)} offers similar capabilities for a ${input.seats}-person team at a lower price point than ${formatToolName(input.toolId)}.`,
        monthlySavings,
        annualSavings: monthlySavings * 12,
        confidence: "low", // Low confidence because switching tools has friction
        optimizationType: "cross-tool",
        severity: "low"
      };
    }
  }
  return null;
}

// RULE TYPE 6 — Credit Opportunity
export function checkCreditOpportunity(
  input: ToolInput
): AuditRecommendation | null {
  if (input.monthlySpend >= 200) {
    return {
      title: `Explore Startup Credits for ${formatToolName(input.toolId)}`,
      description: `High monthly spend detected ($${input.monthlySpend}/mo).`,
      reasoning: `Many AI vendors offer significant startup credit programs (e.g., via Credex or direct incubator partnerships) that could offset this entirely.`,
      monthlySavings: input.monthlySpend, // Potential to save 100% via credits
      annualSavings: input.monthlySpend * 12,
      confidence: "medium",
      optimizationType: "credit-opportunity",
      severity: "high"
    };
  }
  return null;
}

export function generateRecommendations(
  input: ToolInput,
  allInputs: ToolInput[],
  pricingDb: Record<string, ToolPricing>
): AuditRecommendation[] {
  const toolPricing = pricingDb[input.toolId];
  if (!toolPricing) return [];

  const recommendations: AuditRecommendation[] = [];

  // Run all rules
  const apiOverspend = checkApiOverspend(input, toolPricing);
  if (apiOverspend) recommendations.push(apiOverspend);

  const planOverkill = checkPlanOverkill(input, toolPricing);
  if (planOverkill) recommendations.push(planOverkill);

  const overlap = checkOverlappingTools(input, allInputs, pricingDb);
  if (overlap) recommendations.push(overlap);

  // If no plan overkill or overlap, check cross-tool
  if (!planOverkill && !overlap) {
    const crossTool = checkCrossToolOptimization(input, toolPricing, pricingDb);
    if (crossTool) recommendations.push(crossTool);
  }

  const credits = checkCreditOpportunity(input);
  if (credits) recommendations.push(credits);

  return recommendations;
}
