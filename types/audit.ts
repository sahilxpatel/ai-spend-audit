export type UseCaseType = 
  | "coding" 
  | "writing" 
  | "design" 
  | "data-analysis" 
  | "general-chat"
  | "research"
  | "operations"
  | "mixed";

export type RecommendationType = 
  | "downgrade" 
  | "upgrade" 
  | "consolidate" 
  | "keep" 
  | "cancel";

export type PlanPricingType = "per-seat" | "flat" | "usage" | "custom";

export interface PricingPlan {
  name: string;
  price: number;
  pricingType?: PlanPricingType;
  priceNote?: string;
  recommendedTeamSize: [number] | [number, number]; // [min] or [min, max]
  capabilities: string[];
}

export interface ToolPricing {
  displayName?: string;
  category: UseCaseType;
  useCases: UseCaseType[];
  plans: Record<string, PricingPlan>;
}

export interface ToolInput {
  id: string; // unique ID for the form row
  toolId: string; // The ID of the tool (e.g., 'cursor', 'chatgpt')
  planId: string; // The ID of the plan (e.g., 'pro', 'plus')
  monthlySpend: number;
  seats: number;
}

export type RecommendationSeverity = "low" | "medium" | "high" | "critical";

export type OptimizationCategory = 
  | "plan-overkill" 
  | "api-overspend" 
  | "overlapping-tools" 
  | "same-vendor" 
  | "cross-tool" 
  | "credit-opportunity" 
  | "none";

export type AuditConfidence = "low" | "medium" | "high";

export type ToolCategory = UseCaseType | "misc";

export interface AuditRecommendation {
  title: string;
  description: string;
  reasoning: string;
  monthlySavings: number;
  annualSavings: number;
  confidence: AuditConfidence;
  optimizationType: OptimizationCategory;
  severity: RecommendationSeverity;
}

export interface AuditResult {
  toolId: string;
  planId: string;
  currentSpend: number;
  optimalSpend: number;
  potentialSavings: number;
  recommendations: AuditRecommendation[];
  alternatives?: string[];
}

export interface AuditSummary {
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  savingsPercentage: number;
  optimizationScore: number;
  hasHighSavingsOpportunity: boolean;
  results: AuditResult[];
  globalTeamSize: number;
  primaryUseCase: UseCaseType;
}
