import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resendFrom = process.env.RESEND_FROM || 'AI Spend Audit <onboarding@resend.dev>';

if (!resendApiKey) {
  console.warn('RESEND_API_KEY is not set. Emails will not be sent.');
}

if (!process.env.RESEND_FROM) {
  console.warn('RESEND_FROM is not set. Using onboarding@resend.dev for local testing.');
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
    return { success: false, error: 'Missing RESEND_API_KEY' };
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? (process.env.NEXT_PUBLIC_APP_URL.startsWith('http') ? process.env.NEXT_PUBLIC_APP_URL : `https://${process.env.NEXT_PUBLIC_APP_URL}`)
      : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      
    const publicUrl = `${baseUrl}/audit/${auditId}`;
    
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
      from: resendFrom,
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

export interface AffectedAuditInfo {
  auditId: string;
  oldSavings: number;
  newSavings: number;
  priceChanges: {
    toolName: string;
    oldPriceText: string;
    newPriceText: string;
  }[];
}

export interface SendStaleAuditEmailParams {
  to: string;
  audits: AffectedAuditInfo[];
}

export async function sendStaleAuditEmail({ to, audits }: SendStaleAuditEmailParams) {
  if (!resendApiKey) {
    console.log('Skipping email send, no API key:', { to, audits });
    return { success: false, error: 'Missing RESEND_API_KEY' };
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? (process.env.NEXT_PUBLIC_APP_URL.startsWith('http') ? process.env.NEXT_PUBLIC_APP_URL : `https://${process.env.NEXT_PUBLIC_APP_URL}`)
      : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      
    let auditsHtml = '';
    
    for (const audit of audits) {
      const reRunUrl = `${baseUrl}/audit/${audit.auditId}/re-run`;
      
      let priceChangesHtml = '';
      if (audit.priceChanges.length > 0) {
        priceChangesHtml = '<ul>';
        for (const change of audit.priceChanges) {
          priceChangesHtml += `<li>${change.toolName}: ${change.oldPriceText} &rarr; ${change.newPriceText}/seat</li>`;
        }
        priceChangesHtml += '</ul>';
      }

      auditsHtml += `
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; color: #0f172a;">Audit #${audit.auditId.slice(0, 8)}</h3>
          
          <p><strong>Price Changes Detected:</strong></p>
          ${priceChangesHtml || '<p><em>Overall pricing structure changed.</em></p>'}
          
          <div style="background-color: #f1f5f9; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0;">
            <p style="margin: 0;">Your previous audit recommended <strong>$${audit.oldSavings.toLocaleString()}</strong> in monthly savings. Current pricing means we'd recommend <strong>$${audit.newSavings.toLocaleString()}</strong>.</p>
          </div>
          
          <p style="text-align: left; margin: 20px 0 10px 0;">
            <a href="${reRunUrl}" style="background-color: #0f172a; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Updated Audit (Re-run)</a>
          </p>
        </div>
      `;
    }

    const htmlContent = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
        <h2>Pricing Updates Detected</h2>
        <p>Hi there,</p>
        <p>We wanted to let you know that pricing has changed for some of the tools in your AI stack.</p>
        
        ${auditsHtml}
        
        <p style="color: #64748b; font-size: 14px; margin-top: 40px; text-align: center;">
          © ${new Date().getFullYear()} AI Spend Audit.
        </p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: resendFrom,
      to,
      subject: "Your AI spend audit is outdated \u2014 here's what changed",
      html: htmlContent,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending stale audit email:', error);
    return { success: false, error };
  }
}
