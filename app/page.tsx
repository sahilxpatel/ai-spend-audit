"use client";

import { useState } from "react";
import { SpendForm } from "@/components/spend-form";
import { ResultsSummary } from "@/components/results-summary";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { ArrowRight, BarChart3, Cpu, Layers, Search, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-50">SpendAudit</span>
          </a>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">How it works</a>
            <a href="#supported-tools" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Supported Tools</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Abstract Background Gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-slate-50 to-slate-50 dark:from-primary/5 dark:via-slate-950 dark:to-slate-950" />
        
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>Discover your true AI costs</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight max-w-4xl mx-auto mb-8 leading-[1.1]">
            Stop overpaying for your team&apos;s AI subscriptions
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
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
                  <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in">
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
                  <div className="max-w-3xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800">
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
          <section id="features" className="scroll-mt-20 py-24 bg-white dark:bg-slate-900">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Layers className="w-4 h-4" />
                  <span>Why SpendAudit</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4">Built for teams that move fast</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">AI tools change pricing weekly. Your budget shouldn&apos;t suffer because of it.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Feature 1 */}
                <div className="group p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 transition-all hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-600">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">Redundancy Detection</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Find overlapping capabilities across ChatGPT, Claude, Copilot and more. Stop paying twice for the same thing.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="group p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 transition-all hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-600">
                  <div className="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">Plan Optimization</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Know exactly when to upgrade to Team or stick with Pro plans based on your actual headcount.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="group p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 transition-all hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-600">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">Spend Visibility</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    See your total monthly and annual AI costs at a glance with clear optimization scores.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="group p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 transition-all hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-600">
                  <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">Deterministic Engine</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    No AI hallucinations. Our audit math is 100% deterministic using verified pricing data.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="scroll-mt-20 py-24 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-5xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4">How it works</h2>
                <p className="text-slate-600 dark:text-slate-400">Three steps. Under two minutes. Real savings.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 relative">
                {/* Connector line (desktop only) */}
                <div className="hidden md:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-slate-200 dark:bg-slate-700" />

                {/* Step 1 */}
                <div className="relative text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-6 relative z-10 shadow-lg shadow-primary/20">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">Input your stack</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    Add your AI tools, plans, team size, and current monthly spend.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-6 relative z-10 shadow-lg shadow-primary/20">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">Engine analyzes pricing</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    Our deterministic engine checks for overlap, plan mismatches, and pricing inefficiencies.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-6 relative z-10 shadow-lg shadow-primary/20">
                    3
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">Get recommendations</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    Receive actionable savings insights and an AI-generated executive summary.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Supported Tools Section */}
          <section id="supported-tools" className="scroll-mt-20 py-24 bg-white dark:bg-slate-900" suppressHydrationWarning>
            <div className="max-w-5xl mx-auto px-6">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4">Supported tools</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">Analyze pricing overlap across the most commonly used AI tools.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
                {[
                  { name: "ChatGPT", logo: "/logos/openai.svg", label: "OpenAI", plans: "4 plans" },
                  { name: "Claude", logo: "/logos/anthropic.svg", label: "Anthropic", plans: "6 plans" },
                  { name: "Gemini", logo: "/logos/gemini.svg", label: "Google", plans: "4 plans" },
                  { name: "Copilot", logo: "/logos/github.svg", label: "GitHub", plans: "3 plans" },
                  { name: "Cursor", logo: "/logos/cursor.svg", label: "Cursor", plans: "4 plans" },
                  { name: "Windsurf", logo: "/logos/windsurf.svg", label: "Codeium", plans: "3 plans" },
                  { name: "OpenAI API", logo: "/logos/openai.svg", label: "OpenAI", plans: "API direct" },
                  { name: "Anthropic API", logo: "/logos/anthropic.svg", label: "Anthropic", plans: "API direct" },
                ].map((tool) => (
                  <div
                    key={tool.name}
                    className="group bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center transition-all hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-500 hover:-translate-y-1 cursor-default"
                  >
                    <div className="w-10 h-10 mx-auto mb-4 text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform">
                      <img
                        src={tool.logo}
                        alt={`${tool.name} logo`}
                        width={40}
                        height={40}
                        loading="lazy"
                        decoding="async"
                        suppressHydrationWarning
                        className="w-10 h-10 dark:invert dark:brightness-200 opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tool.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{tool.plans}</p>
                  </div>
                ))}
              </div>

              <p className="text-center text-sm text-slate-500 dark:text-slate-500 mt-10">
                Pricing data is updated regularly and verified against official sources.
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-slate-900 dark:bg-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60" />
            <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">Ready to optimize your spend?</h2>
              <p className="text-lg text-slate-400 mb-8">
                Takes under two minutes. No signup required.
              </p>
              <Button
                size="lg"
                className="px-8 text-lg bg-white text-slate-900 hover:bg-slate-100 h-14 rounded-full shadow-xl"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Start Your Free Audit <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <BarChart3 className="w-5 h-5 text-slate-400" />
            <span className="font-semibold text-slate-600 dark:text-slate-400">SpendAudit</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} AI Spend Audit. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
