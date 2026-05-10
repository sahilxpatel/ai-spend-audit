"use client";

import { AuditSummary } from "@/types/audit";
import { SavingsHero } from "./savings-hero";
import { RecommendationCard } from "./recommendation-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Loader2, CheckCircle } from "lucide-react";

interface ResultsSummaryProps {
  audit: AuditSummary;
  aiSummary: string | null;
  isLoadingSummary: boolean;
  onReset: () => void;
}

export function ResultsSummary({ audit, aiSummary, isLoadingSummary, onReset }: ResultsSummaryProps) {
  // Flatten recommendations
  const allRecommendations = audit.results.flatMap((res) => 
    res.recommendations.map(rec => ({
      toolId: res.toolId,
      currentSpend: res.currentSpend,
      recommendation: rec
    }))
  );

  // Sort by highest monthly savings
  allRecommendations.sort((a, b) => b.recommendation.monthlySavings - a.recommendation.monthlySavings);

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Your Audit Results</h2>
          <p className="text-slate-500 mt-1">Based on live pricing data and usage patterns</p>
        </div>
        <Button variant="outline" onClick={onReset} className="hidden sm:flex">
          Audit Another Stack
        </Button>
      </div>

      <SavingsHero 
        totalMonthlySavings={audit.totalMonthlySavings}
        totalAnnualSavings={audit.totalAnnualSavings}
        optimizationScore={audit.optimizationScore}
        savingsPercentage={audit.savingsPercentage}
      />

      {/* AI Summary Section */}
      <div className="mb-12 bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">AI Financial Summary</h3>
        </div>
        
        {isLoadingSummary ? (
          <div className="flex items-center gap-3 text-slate-500 py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <p>Analyzing your spend stack...</p>
          </div>
        ) : (
          <p className="text-slate-700 leading-relaxed text-lg">
            {aiSummary || "We analyzed your stack and found optimization opportunities. Review the detailed recommendations below to streamline your tooling costs."}
          </p>
        )}
      </div>

      {/* Recommendations List */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Actionable Recommendations</h3>
        
        {allRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allRecommendations.map((item, idx) => (
              <RecommendationCard 
                key={`${item.toolId}-${idx}`} 
                toolId={item.toolId} 
                recommendation={item.recommendation} 
                currentSpend={item.currentSpend}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">You&apos;re highly optimized!</h4>
            <p className="text-slate-600 max-w-md mx-auto">
              We couldn&apos;t find any significant inefficiencies in your current AI tool stack. You are already spending efficiently.
            </p>
          </div>
        )}
      </div>

      {/* Conditional CTA */}
      <div className="bg-slate-900 rounded-3xl p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
        <div className="relative z-10">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {audit.hasHighSavingsOpportunity 
              ? "Ready to reclaim your budget?" 
              : "Stay ahead of AI pricing changes"}
          </h3>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            {audit.hasHighSavingsOpportunity
              ? `Let our team help you safely implement these changes and save $${audit.totalAnnualSavings.toLocaleString()} this year.`
              : "Subscribe to our optimization alerts and get notified when new tools or pricing tiers can save you money."}
          </p>
          <Button size="lg" className="px-8 text-lg bg-white text-slate-900 hover:bg-slate-100 h-14 rounded-full shadow-xl">
            {audit.hasHighSavingsOpportunity ? "Book Credex Consultation" : "Get Optimization Updates"}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

    </div>
  );
}
