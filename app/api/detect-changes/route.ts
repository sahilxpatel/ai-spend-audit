import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { aggregateAudit } from '@/lib/audit-engine';
import { pricing as currentPricing } from '@/lib/pricing';
import { ToolInput } from '@/types/audit';

export async function POST(req: Request) {
  // Step 1: Security
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role key to bypass RLS for admin operations, if available,
  // else fallback to anon key (assuming RLS is either disabled or allows anon update)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Step 2: Detection Logic
  // Fetch all audits from Supabase where is_stale = false
  const { data: audits, error: fetchError } = await supabase
    .from('audits')
    .select('*')
    .eq('is_stale', false);

  if (fetchError) {
    console.error('Error fetching audits:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 });
  }

  const affectedAudits = [];
  const affectedUsersMap = new Map<string, any[]>();
  let checkedCount = audits?.length || 0;
  let flaggedCount = 0;

  if (audits && audits.length > 0) {
    for (const audit of audits) {
      if (!audit.input_stack) continue;
      
      // Parse input_stack if it's a string, or use directly if it's an object/array
      const inputStack: ToolInput[] = Array.isArray(audit.input_stack) 
        ? (audit.input_stack as unknown as ToolInput[])
        : (typeof audit.input_stack === 'string' ? JSON.parse(audit.input_stack) : []);

      if (inputStack.length === 0) continue;

      // Re-run through aggregateAudit using current pricing
      const freshOutput = aggregateAudit(inputStack, currentPricing);
      
      // Compare freshly generated output against stored output_result
      const storedOutputStr = JSON.stringify(audit.output_result);
      const freshOutputStr = JSON.stringify(freshOutput);

      if (storedOutputStr !== freshOutputStr) {
        // If they differ, update is_stale = true
        const { error: updateError } = await supabase
          .from('audits')
          .update({ is_stale: true })
          .eq('id', audit.id);

        if (updateError) {
          console.error(`Error updating audit ${audit.id}:`, updateError);
          continue;
        }

        flaggedCount++;
        affectedAudits.push(audit);
        
        // Group by user_email
        if (audit.user_email) {
          if (!affectedUsersMap.has(audit.user_email)) {
            affectedUsersMap.set(audit.user_email, []);
          }
          affectedUsersMap.get(audit.user_email)!.push(audit);
        }
      }
    }
  }

  // Step 3: Return
  return NextResponse.json({
    checked_audits: checkedCount,
    flagged_audits: flaggedCount,
    affected_users: Object.fromEntries(affectedUsersMap)
  });
}

// Allow GET for easy manual testing as requested (or just stick to POST, but let's provide GET too just in case)
export async function GET(req: Request) {
  return POST(req);
}
