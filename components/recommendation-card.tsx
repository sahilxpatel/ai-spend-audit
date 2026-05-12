import { AlertTriangle, CheckCircle2, Info, ArrowDownRight, RefreshCcw, XCircle, ArrowUpRight, LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AuditRecommendation, RecommendationSeverity, RecommendationType } from "@/types/audit";
import { pricing } from "@/lib/pricing";

interface RecommendationCardProps {
  toolId: string;
  recommendation: AuditRecommendation;
  currentSpend: number;
}

const severityConfig: Record<RecommendationSeverity, { color: string; bg: string; darkBg: string; icon: LucideIcon }> = {
  critical: { color: "text-red-600 dark:text-red-400", bg: "bg-red-50", darkBg: "dark:bg-red-950/50", icon: AlertTriangle },
  high: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50", darkBg: "dark:bg-amber-950/50", icon: AlertTriangle },
  medium: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50", darkBg: "dark:bg-blue-950/50", icon: Info },
  low: { color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50", darkBg: "dark:bg-slate-800", icon: CheckCircle2 },
};

const actionIconConfig: Record<RecommendationType, LucideIcon> = {
  downgrade: ArrowDownRight,
  upgrade: ArrowUpRight,
  consolidate: RefreshCcw,
  cancel: XCircle,
  keep: CheckCircle2,
};

export function RecommendationCard({ toolId, recommendation, currentSpend }: RecommendationCardProps) {
  const toolName = pricing[toolId]?.plans[Object.keys(pricing[toolId]?.plans)[0]]?.name.split(" ")[0] || toolId;
  const capitalizedToolName = toolName.charAt(0).toUpperCase() + toolName.slice(1);
  
  const SeverityIcon = severityConfig[recommendation.severity].icon;
  // Infer action type from title or optimizationType as a fallback if we don't have explicit type
  let actionType: RecommendationType = "keep";
  if (recommendation.optimizationType === "plan-overkill") actionType = "downgrade";
  if (recommendation.optimizationType === "overlapping-tools") actionType = "cancel";
  if (recommendation.optimizationType === "same-vendor") actionType = "consolidate";
  
  const ActionIcon = actionIconConfig[actionType] || CheckCircle2;

  const hasSavings = recommendation.monthlySavings > 0;

  return (
    <Card className="overflow-hidden border-slate-200 dark:border-slate-700 shadow-sm transition-shadow hover:shadow-md">
      <div className={`h-1.5 w-full ${severityConfig[recommendation.severity].bg.replace('bg-', 'bg-').replace('50', '500')}`} />
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {capitalizedToolName}
              </span>
              <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${severityConfig[recommendation.severity].bg} ${severityConfig[recommendation.severity].darkBg} ${severityConfig[recommendation.severity].color}`}>
                <SeverityIcon className="w-3 h-3" />
                {recommendation.severity.charAt(0).toUpperCase() + recommendation.severity.slice(1)} Priority
              </span>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 leading-tight">
              {recommendation.title}
            </CardTitle>
            <CardDescription className="text-slate-600 text-sm mt-2">
              {recommendation.description}
            </CardDescription>
          </div>
          
          {hasSavings && (
            <div className="text-right flex-shrink-0 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800">
              <p className="text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">Save</p>
              <p className="text-2xl font-extrabold text-emerald-600 leading-none">
                ${recommendation.monthlySavings}<span className="text-sm font-semibold text-emerald-500">/mo</span>
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
            <ActionIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Why this matters
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {recommendation.reasoning}
          </p>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-4">
            <span>Current Spend: ${currentSpend}/mo</span>
            {hasSavings && (
              <span>Annual Impact: <span className="text-emerald-600 font-bold">${recommendation.annualSavings}</span></span>
            )}
          </div>
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
            Confidence: {recommendation.confidence.charAt(0).toUpperCase() + recommendation.confidence.slice(1)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
