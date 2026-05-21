import { getAuditById } from '@/lib/audits';
import { aggregateAudit } from '@/lib/audit-engine';
import { pricing as currentPricing } from '@/lib/pricing';
import { redirect } from 'next/navigation';
import { ToolInput, AuditSummary } from '@/types/audit';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export default async function ReRunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const auditRow = await getAuditById(id);
  
  // Edge Case 1: If audit ID doesn't exist — show a clear error message
  if (!auditRow) {
    return (
      <div className="container mx-auto py-20 text-center px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4 text-red-400">Audit Not Found</h1>
        <p className="text-slate-400 mb-8">We couldn&apos;t find the requested audit. It may have been deleted or the ID is incorrect.</p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Start New Audit
        </Link>
      </div>
    );
  }

  // Parse input
  const inputStack: ToolInput[] = Array.isArray(auditRow.input_stack) 
    ? auditRow.input_stack as unknown as ToolInput[]
    : (typeof auditRow.input_stack === 'string' ? JSON.parse(auditRow.input_stack) : []);

  if (!inputStack.length) {
    return (
      <div className="container mx-auto py-20 text-center px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4 text-white">Invalid Audit Data</h1>
        <p className="text-slate-400">No tool inputs found for this audit.</p>
      </div>
    );
  }

  // Note: If reaudited_from is null, it still works correctly because we just rely on input_stack
  
  const oldOutput = auditRow.output_result as unknown as AuditSummary;
  const newOutput = aggregateAudit(inputStack, currentPricing);

  const oldSavings = oldOutput?.totalMonthlySavings || 0;
  const newSavings = newOutput.totalMonthlySavings;

  const oldSavingsJson = JSON.stringify(oldOutput);
  const newSavingsJson = JSON.stringify(newOutput);
  const hasPricingChanged = oldSavingsJson !== newSavingsJson;

  // Edge Case 3: If pricing hasn't changed
  if (!hasPricingChanged) {
    return (
      <div className="container mx-auto py-20 text-center px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4 text-white">No changes detected.</h1>
        <p className="text-slate-400 mb-8 text-lg">Your audit is still accurate based on current pricing data.</p>
        <Link href={`/audit/${id}`} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          View Original Audit
        </Link>
      </div>
    );
  }

  const oldPricing = (auditRow.pricing_snapshot as unknown || {}) as Record<string, import('@/types/audit').ToolPricing>;

  // Combine rows for side-by-side table
  const rows = inputStack.map((input, index) => {
    const oldRes = oldOutput?.results?.[index];
    const newRes = newOutput?.results?.[index];
    
    const isChanged = JSON.stringify(oldRes || {}) !== JSON.stringify(newRes || {});
    
    const oldOptimal = oldRes?.optimalSpend || 0;
    const newOptimal = newRes?.optimalSpend || 0;

    const oldToolPrice = oldPricing?.[input.toolId]?.plans?.[input.planId]?.price;
    const newToolPrice = currentPricing[input.toolId]?.plans?.[input.planId]?.price;
    const basePriceChanged = oldToolPrice !== undefined && newToolPrice !== undefined && oldToolPrice !== newToolPrice;

    // Determine type of change
    let changeType: 'unchanged' | 'increase' | 'cheaper' | 'changed' = 'unchanged';
    if (isChanged || basePriceChanged) {
      if (newOptimal > oldOptimal) changeType = 'increase'; // Cost went up -> less savings or more spend
      else if (newOptimal < oldOptimal) changeType = 'cheaper'; // Cost went down -> more savings or less spend
      else changeType = 'changed'; // other recommendations changed but spend is same
    }

    // Format recommendations text
    const formatRecs = (recs: { title: string }[]) => {
      if (!recs || recs.length === 0) return "Keep current plan (Optimal)";
      return recs.map(r => r.title).join(", ");
    };

    return {
      toolId: input.toolId,
      planId: input.planId,
      oldRecText: formatRecs(oldRes?.recommendations),
      newRecText: formatRecs(newRes?.recommendations),
      changeType,
      oldOptimal: oldRes?.optimalSpend || 0,
      newOptimal: newRes?.optimalSpend || 0,
      toolName: currentPricing[input.toolId]?.displayName || input.toolId,
      oldToolPrice,
      newToolPrice,
      basePriceChanged
    };
  });

  // Server action to save the updated audit
  const handleSave = async () => {
    "use server";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from('audits').update({
       audit_data: JSON.parse(JSON.stringify(newOutput)),
       output_result: JSON.parse(JSON.stringify(newOutput)),
       pricing_snapshot: JSON.parse(JSON.stringify(currentPricing)),
       is_stale: false
    }).eq('id', id);
    
    redirect(`/audit/${id}`);
  };

  return (
    <div className="container mx-auto py-16 px-4 max-w-5xl">
      <div className="text-center mb-12">
        <h2 className="text-slate-400 font-medium tracking-wider uppercase text-sm mb-3">Re-audit Results</h2>
        {/* Big and prominent Hero Headline */}
        {oldSavings !== newSavings ? (
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Your potential savings changed from <span className="text-slate-500 line-through">${oldSavings}</span> <span className="text-blue-400">→ ${newSavings}</span>
          </h1>
        ) : (
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Your optimized stack cost changed from <span className="text-slate-500 line-through">${oldOutput?.totalRecommendedSpend || 0}</span> <span className="text-blue-400">→ ${newOutput.totalRecommendedSpend}</span>
          </h1>
        )}
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          We&apos;ve re-run your stack against our latest pricing database. Here is the tool-by-tool breakdown.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="p-4 font-semibold text-sm">Tool</th>
                <th className="p-4 font-semibold text-sm w-1/3">Old Recommendation</th>
                <th className="p-4 font-semibold text-sm w-1/3">New Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, i) => {
                let bgClass = "bg-white";
                if (row.changeType === 'increase') bgClass = "bg-red-50/50";
                else if (row.changeType === 'cheaper') bgClass = "bg-green-50/50";
                else if (row.changeType === 'changed') bgClass = "bg-amber-50/50";
                
                const isMuted = row.changeType === 'unchanged';

                return (
                  <tr key={i} className={`${bgClass} transition-colors hover:bg-slate-50`}>
                    <td className={`p-4 align-top ${isMuted ? 'text-slate-400' : 'text-slate-900'}`}>
                      <div className="font-medium text-lg">{row.toolName}</div>
                      <div className={`text-sm mt-1 ${isMuted ? 'text-slate-300' : 'text-slate-500'}`}>Plan: {row.planId}</div>
                      {row.basePriceChanged && (
                        <div className="mt-3 inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-200">
                          Base price changed: ${row.oldToolPrice} &rarr; ${row.newToolPrice}/seat
                        </div>
                      )}
                    </td>
                    <td className={`p-4 align-top ${isMuted ? 'text-slate-400' : 'text-slate-600'}`}>
                      {row.oldRecText}
                      {!isMuted && <div className="text-xs text-slate-400 mt-2">Optimal Spend: ${row.oldOptimal}/mo</div>}
                    </td>
                    <td className={`p-4 align-top font-medium ${isMuted ? 'text-slate-400' : 'text-slate-900'}`}>
                      {row.newRecText}
                      {!isMuted && (
                        <div className={`text-xs mt-2 font-bold ${row.changeType === 'increase' ? 'text-red-600' : row.changeType === 'cheaper' ? 'text-green-600' : 'text-amber-600'}`}>
                          Optimal Spend: ${row.newOptimal}/mo
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center">
        <form action={handleSave}>
          <button type="submit" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg hover:shadow-blue-900/50 flex items-center gap-2">
            Save updated audit
          </button>
        </form>
      </div>
    </div>
  );
}
// Triggering Turbopack file watcher refresh
