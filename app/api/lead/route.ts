import { NextResponse } from 'next/server';
import { createLead } from '@/lib/leads';
import { getAuditById } from '@/lib/audits';
import { sendAuditEmail } from '@/lib/resend';
import { z } from 'zod';
import { AuditSummary } from '@/types/audit';

const leadSchema = z.object({
  audit_id: z.string().uuid(),
  email: z.string().email(),
  company: z.string().optional(),
  role: z.string().optional(),
  team_size: z.union([z.number(), z.string()]).optional(),
  // Honeypot field
  bot_field: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = leadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid lead data', details: result.error }, { status: 400 });
    }

    const { bot_field, audit_id, email, company, role, team_size } = result.data;

    // Abuse protection: If honeypot is filled, silently return success without saving
    if (bot_field && bot_field.length > 0) {
      console.log('Honeypot triggered, ignoring submission');
      return NextResponse.json({ success: true, message: 'Lead captured' }); // Fake success
    }

    // Verify audit exists
    const auditRecord = await getAuditById(audit_id);
    if (!auditRecord) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    // Save lead
    await createLead({ audit_id, email, company, role, team_size });

    // Try to send email asynchronously (or await, better to await to confirm it worked, but Resend is fast)
    const auditData = auditRecord.audit_data as unknown as AuditSummary;
    let emailSent = false;
    let emailError: string | null = null;

    if (auditData && auditData.totalMonthlySavings !== undefined) {
      const monthlySavings = auditData.totalMonthlySavings;
      const annualSavings = monthlySavings * 12;

      const emailResult = await sendAuditEmail({
        to: email,
        auditId: audit_id,
        monthlySavings,
        annualSavings,
      });

      emailSent = emailResult.success;
      if (!emailSent) {
        emailError = emailResult.error ? String(emailResult.error) : 'Unknown email error';
        console.warn('Email send failed:', emailError);
      }
    }

    return NextResponse.json({ success: true, emailSent, emailError });
  } catch (error) {
    console.error('Lead capture API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
