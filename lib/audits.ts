import { getSupabase } from './supabase';
import { AuditSummary } from '@/types/audit';
import { Database, Json } from '@/types/database';

type AuditRow = Database['public']['Tables']['audits']['Row'];

export async function createAudit(
  auditData: AuditSummary, 
  summary: string | null = null,
  user_email: string | null = null,
  input_stack: any = null,
  output_result: any = null,
  pricing_snapshot: any = null,
  pricing_version: string | null = null
) {
  const supabase = getSupabase();
  const payload: Database['public']['Tables']['audits']['Insert'] = {
    audit_data: auditData as unknown as Json,
    summary,
    user_email,
    input_stack: input_stack as unknown as Json,
    output_result: output_result as unknown as Json,
    pricing_snapshot: pricing_snapshot as unknown as Json,
    pricing_version,
  };

  const { data, error } = await supabase
    .from('audits')
    .insert([payload])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating audit:', error);
    throw new Error('Failed to create audit');
  }

  return data;
}

export async function getAuditById(id: string): Promise<AuditRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching audit:', error);
    return null;
  }

  return data as AuditRow;
}
