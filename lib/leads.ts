import { getSupabase } from './supabase';

export interface LeadInput {
  audit_id: string;
  email: string;
  company?: string;
  role?: string;
  team_size?: number | string;
}

export async function createLead(leadData: LeadInput) {
  const supabase = getSupabase();
  const { data, error } = await (supabase.from('leads') as any)
    .insert([
      {
        audit_id: leadData.audit_id,
        email: leadData.email,
        company: leadData.company || null,
        role: leadData.role || null,
        team_size: leadData.team_size ? Number(leadData.team_size) : null,
      },
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating lead:', error);
    throw new Error('Failed to create lead');
  }

  return data;
}
