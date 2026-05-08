export type UseCaseType = 
  | "coding" 
  | "writing" 
  | "design" 
  | "data-analysis" 
  | "general-chat"
  | "research"
  | "operations";

export type RecommendationType = 
  | "downgrade" 
  | "upgrade" 
  | "consolidate" 
  | "keep" 
  | "cancel";

export interface PricingPlan {
  name: string;
  price: number;
  recommendedTeamSize: [number] | [number, number]; // [min] or [min, max]
  capabilities: string[];
}

export interface ToolPricing {
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

export interface AuditResult {
  toolId: string;
  planId: string;
  currentSpend: number;
  optimalSpend: number;
  potentialSavings: number;
  recommendationType: RecommendationType;
  rationale: string;
  alternatives?: string[];
}

export interface AuditSummary {
  totalCurrentSpend: number;
  totalOptimalSpend: number;
  totalPotentialSavings: number;
  results: AuditResult[];
  globalTeamSize: number;
  primaryUseCase: UseCaseType;
}
