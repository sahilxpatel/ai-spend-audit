import { NextResponse } from 'next/server';
import { createAudit } from '@/lib/audits';
import { z } from 'zod';
import { AuditSummary } from '@/types/audit';

// Basic validation aligned with AuditSummary payload
const auditSchema = z.object({
  audit: z.object({
    totalCurrentSpend: z.number(),
    totalRecommendedSpend: z.number(),
    totalMonthlySavings: z.number(),
    totalAnnualSavings: z.number(),
    savingsPercentage: z.number(),
    optimizationScore: z.number(),
    hasHighSavingsOpportunity: z.boolean(),
    results: z.array(z.any()),
    globalTeamSize: z.number(),
    primaryUseCase: z.enum([
      "coding",
      "writing",
      "design",
      "data-analysis",
      "general-chat",
      "research",
      "operations",
      "mixed",
    ] as const),
  }),
  summary: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = auditSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid audit data', details: result.error }, { status: 400 });
    }

    const { audit, summary } = result.data;
    const { id } = await createAudit(audit as unknown as AuditSummary, summary || null);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
