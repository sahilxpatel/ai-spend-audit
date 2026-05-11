import { NextResponse } from 'next/server';
import { createAudit } from '@/lib/audits';
import { z } from 'zod';

// We just do a basic validation for presence, the actual structure is typed elsewhere
const auditSchema = z.object({
  audit: z.object({
    tools: z.array(z.any()),
    totalMonthlySpend: z.number(),
    totalMonthlySavings: z.number(),
    recommendations: z.array(z.any()),
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
    const { id } = await createAudit(audit as any, summary || null);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
