import { getSupabase } from './supabase';
import { AuditSummary } from '@/types/audit';
import { Database, Json } from '@/types/database';

type AuditRow = Database['public']['Tables']['audits']['Row'];

export async function createAudit(auditData: AuditSummary, summary: string | null = null) {
  const supabase = getSupabase();
  const payload: Database['public']['Tables']['audits']['Insert'] = {
    audit_data: auditData as unknown as Json,
    summary,
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
