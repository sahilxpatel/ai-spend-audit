import { getAuditById } from "@/lib/audits";
import { ResultsSummary } from "@/components/results-summary";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { AuditSummary } from "@/types/audit";

interface Props {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for Open Graph / SEO
export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { id } = await params;
  if (!id) {
    return {
      title: "Audit Not Found | AI Spend Audit",
    };
  }
  const auditRecord = await getAuditById(id);

  if (!auditRecord) {
    return {
      title: "Audit Not Found | AI Spend Audit",
    };
  }

  const auditData = auditRecord.audit_data as unknown as AuditSummary;
  const annualSavings = auditData.totalMonthlySavings * 12;

  const title = `AI Spend Audit found $${annualSavings.toLocaleString()}/year in savings`;
  const description = `This startup could save $${auditData.totalMonthlySavings.toLocaleString()}/month on AI tools. View their full AI stack optimization breakdown.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicAuditPage({ params }: Props) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const auditRecord = await getAuditById(id);

  if (!auditRecord) {
    notFound();
  }

  const auditData = auditRecord.audit_data as unknown as AuditSummary;
  const aiSummary = auditRecord.summary;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary/20 selection:text-primary">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">SpendAudit</span>
          </Link>
          <div className="flex items-center">
            <Link 
              href="/"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Get your own audit &rarr;
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mb-4">
            Public Audit Result
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            AI Stack Optimization Report
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            This team identified ${auditData.totalMonthlySavings.toLocaleString()}/mo in potential savings across their AI subscriptions.
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
          <ResultsSummary 
            audit={auditData} 
            aiSummary={aiSummary} 
            isLoadingSummary={false} 
            onReset={() => {}}
          />
        </div>
        
        <div className="mt-16 text-center pb-16">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Are you overpaying for AI?</h3>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Takes 2 minutes. No credit card required. See exactly where your team can save money without losing capabilities.
          </p>
          <Link 
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Audit My Team&apos;s Spend
          </Link>
        </div>
      </div>
    </div>
  );
}
