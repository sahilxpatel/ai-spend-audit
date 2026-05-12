import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';

if (!resendApiKey) {
  console.warn('RESEND_API_KEY is not set. Emails will not be sent.');
}

export const resend = new Resend(resendApiKey);

export interface SendAuditEmailParams {
  to: string;
  auditId: string;
  monthlySavings: number;
  annualSavings: number;
}

export async function sendAuditEmail({ to, auditId, monthlySavings, annualSavings }: SendAuditEmailParams) {
  if (!resendApiKey) {
    console.log('Skipping email send, no API key:', { to, auditId, monthlySavings, annualSavings });
    return { success: false, error: 'No API key' };
  }

  try {
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/audit/${auditId}`;
    
    // Optional consultation text if savings > 500/mo
    const consultationText = monthlySavings > 500 
      ? `<p><strong>High Savings Alert:</strong> We noticed your team could save over $500/month. We offer a complimentary 30-minute consultation to help you implement these savings. Reply to this email to book a slot.</p>`
      : '';

    const htmlContent = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
        <h2>Your AI Spend Audit Results</h2>
        <p>Thank you for completing the AI Spend Audit. We've analyzed your team's tool stack and found potential optimizations.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0f172a;">Optimization Potential</h3>
          <p style="margin: 5px 0;"><strong>Monthly Savings:</strong> $${monthlySavings.toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Annual Savings:</strong> $${annualSavings.toLocaleString()}</p>
        </div>

        ${consultationText}

        <p>You can view your detailed recommendations, identified redundancies, and full AI summary at your private link below:</p>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${publicUrl}" style="background-color: #0f172a; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Full Audit Results</a>
        </p>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 40px; text-align: center;">
          © ${new Date().getFullYear()} AI Spend Audit.
        </p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'AI Spend Audit <audit@sahilajani.me>',
      to,
      subject: `Your AI Spend Audit Results - $${monthlySavings.toLocaleString()}/mo in potential savings`,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
