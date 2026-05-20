import { NextResponse } from 'next/server';
import { createAudit } from '@/lib/audits';
import { z } from 'zod';
import { AuditSummary } from '@/types/audit';
import { pricing, PRICING_VERSION } from '@/lib/pricing';

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
  user_email: z.string().email().nullable().optional(),
  input_stack: z.any().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = auditSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid audit data', details: result.error }, { status: 400 });
    }

    const { audit, summary, user_email, input_stack } = result.data;
    const { id } = await createAudit(
      audit as unknown as AuditSummary, 
      summary || null,
      user_email || null,
      input_stack || null,
      audit,
      pricing,
      PRICING_VERSION
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
