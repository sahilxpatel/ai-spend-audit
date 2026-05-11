import { getSupabase } from './supabase';
import { AuditSummary } from '@/types/audit';

export async function createAudit(auditData: AuditSummary, summary: string | null = null) {
  const supabase = getSupabase();
  const { data, error } = await (supabase.from('audits') as any)
    .insert([
      {
        audit_data: auditData as any,
        summary,
      },
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating audit:', error);
    throw new Error('Failed to create audit');
  }

  return data;
}

export async function getAuditById(id: string) {
  const supabase = getSupabase();
  const { data, error } = await (supabase.from('audits') as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching audit:', error);
    return null;
  }

  return data;
}
