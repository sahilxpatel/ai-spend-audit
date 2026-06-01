export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      audits: {
        Row: {
          id: string
          audit_data: Json
          summary: string | null
          created_at: string
          user_email: string | null
          input_stack: Json | null
          output_result: Json | null
          pricing_snapshot: Json | null
          pricing_version: string | null
          is_stale: boolean
          reaudited_from: string | null
        }
        Insert: {
          id?: string
          audit_data: Json
          summary?: string | null
          created_at?: string
          user_email?: string | null
          input_stack?: Json | null
          output_result?: Json | null
          pricing_snapshot?: Json | null
          pricing_version?: string | null
          is_stale?: boolean
          reaudited_from?: string | null
        }
        Update: {
          id?: string
          audit_data?: Json
          summary?: string | null
          created_at?: string
          user_email?: string | null
          input_stack?: Json | null
          output_result?: Json | null
          pricing_snapshot?: Json | null
          pricing_version?: string | null
          is_stale?: boolean
          reaudited_from?: string | null
        }
      }
      leads: {
        Row: {
          id: string
          audit_id: string
          email: string
          company: string | null
          role: string | null
          team_size: number | null
          created_at: string
        }
        Insert: {
          id?: string
          audit_id: string
          email: string
          company?: string | null
          role?: string | null
          team_size?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          audit_id?: string
          email?: string
          company?: string | null
          role?: string | null
          team_size?: number | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
