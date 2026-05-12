"use client";

import { useState } from "react";
import { SpendForm } from "@/components/spend-form";
import { ResultsSummary } from "@/components/results-summary";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { ArrowRight, BarChart3, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aggregateAudit } from "@/lib/audit-engine";
import { AuditSummary, ToolInput } from "@/types/audit";

export default function Home() {
  const [auditResult, setAuditResult] = useState<AuditSummary | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleAuditComplete = async (formData: { tools: ToolInput[] }) => {
    setApiError(null);
    // Run deterministic engine
    const summary = aggregateAudit(formData.tools);
    setAuditResult(summary);
    
    // Fetch AI summary
    setIsLoadingSummary(true);
    let generatedSummary: string | null = null;
    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(summary),
      });
      const data = await response.json();
      if (data.summary) {
        setAiSummary(data.summary);
        generatedSummary = data.summary;
      }
    } catch (error) {
      console.error("Failed to fetch AI summary", error);
      setApiError("We couldn't generate the AI summary, but your detailed audit results are ready below.");
    } finally {
      setIsLoadingSummary(false);
    }

    // Save audit to backend
    try {
      const saveResponse = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audit: summary, summary: generatedSummary }),
      });
      const saveData = await saveResponse.json();
      if (saveData.id) {
        setAuditId(saveData.id);
      }
    } catch (error) {
      console.error("Failed to save audit", error);
      setApiError(prev => prev || "Your audit couldn't be saved for sharing, but you can still view your results here.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary/20 selection:text-primary">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">SpendAudit</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing Data</a>
          </div>
          <Button variant="outline" size="sm" className="hidden md:flex">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Abstract Background Gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-slate-50 to-slate-50" />
        
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>Discover your true AI costs</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto mb-8 leading-[1.1]">
            Stop overpaying for your team&apos;s AI subscriptions
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Audit your team&apos;s current AI tool stack. We identify unused seats, overlapping capabilities, and better pricing tiers to save you thousands annually.
          </p>

          {/* Main Content Area: Form or Results */}
          <div className="mt-8 text-left space-y-12">
            {!auditResult ? (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <SpendForm onAuditComplete={handleAuditComplete} />
              </div>
            ) : (
              <div className="space-y-12">
                {apiError && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in">
                    <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm font-medium">{apiError}</p>
                  </div>
                )}
                <ResultsSummary 
                  audit={auditResult} 
                  aiSummary={aiSummary} 
                  isLoadingSummary={isLoadingSummary} 
                  onReset={() => {
                    setAuditResult(null);
                    setAiSummary(null);
                    setAuditId(null);
                    setApiError(null);
                  }} 
                />
                
                {auditId && (
                  <div className="max-w-3xl mx-auto pt-8 border-t border-slate-200">
                    <LeadCaptureForm auditId={auditId} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Hide lower sections if showing results */}
      {!auditResult && (
        <>
          {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why audit your AI spend?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">The AI landscape changes weekly. Keep your budget optimized without sacrificing capabilities.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Identify Redundancies</h3>
              <p className="text-slate-600 leading-relaxed">
                Paying for ChatGPT Plus, Claude Pro, and Gemini Advanced? Discover overlaps in capabilities and consolidate your stack.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Plan Optimization</h3>
              <p className="text-slate-600 leading-relaxed">
                Determine exactly when it makes sense to upgrade from individual licenses to an enterprise team plan based on your headcount.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Real-time Pricing</h3>
              <p className="text-slate-600 leading-relaxed">
                Our deterministic engine uses live, verified pricing data so your audit recommendations are always accurate and actionable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary/20 via-slate-900 to-slate-900" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to optimize your team&apos;s spend?</h2>
          <p className="text-xl text-slate-300 mb-10">
            Join hundreds of forward-thinking teams keeping their AI stack lean and effective.
          </p>
          <Button size="lg" className="px-8 text-lg bg-white text-slate-900 hover:bg-slate-100 h-14 rounded-full shadow-xl">
            Start Your Free Audit <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
      </>
      )}

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <BarChart3 className="w-5 h-5 text-slate-400" />
            <span className="font-semibold text-slate-600">SpendAudit</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} AI Spend Audit. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
