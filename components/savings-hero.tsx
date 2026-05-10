import { TrendingDown, Activity } from "lucide-react";

interface SavingsHeroProps {
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  optimizationScore: number;
  savingsPercentage: number;
}

export function SavingsHero({
  totalMonthlySavings,
  totalAnnualSavings,
  optimizationScore,
  savingsPercentage,
}: SavingsHeroProps) {
  const hasSavings = totalMonthlySavings > 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 md:p-12 mb-8">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-slate-900 to-slate-900 opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Savings Display */}
        <div className="md:col-span-2 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 text-sm font-medium backdrop-blur-sm">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span>Optimization Opportunity Found</span>
          </div>
          
          <div>
            <p className="text-slate-400 text-lg font-medium mb-1">Potential Monthly Savings</p>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
                ${totalMonthlySavings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-xl text-slate-400 font-medium">/mo</span>
            </div>
          </div>
          
          <div className="pt-2 flex flex-wrap items-center gap-6">
            <div className="flex flex-col">
              <span className="text-slate-400 text-sm font-medium">Annual Impact</span>
              <span className="text-2xl font-bold text-emerald-400">
                ${totalAnnualSavings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            
            {hasSavings && (
              <div className="hidden sm:block w-px h-10 bg-slate-800" />
            )}

            {hasSavings && (
              <div className="flex flex-col">
                <span className="text-slate-400 text-sm font-medium">Spend Reduction</span>
                <span className="text-2xl font-bold text-white">
                  {savingsPercentage.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Score Display */}
        <div className="flex md:flex-col items-center md:items-end justify-center md:justify-start gap-4 md:gap-2 bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
          <div className="text-center md:text-right w-full">
            <span className="text-slate-400 text-sm font-medium flex items-center justify-center md:justify-end gap-2 mb-2">
              <Activity className="w-4 h-4" />
              Optimization Score
            </span>
            <div className="text-4xl font-bold text-white mb-1">
              {optimizationScore}
              <span className="text-xl text-slate-500 font-normal">/100</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-3 overflow-hidden">
              <div 
                className={`h-full rounded-full ${optimizationScore >= 80 ? 'bg-emerald-500' : optimizationScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${optimizationScore}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-3">
              {optimizationScore >= 80 ? "Highly Optimized" : optimizationScore >= 50 ? "Needs Improvement" : "Critical Overspend"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
