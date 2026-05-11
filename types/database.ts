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
        }
        Insert: {
          id?: string
          audit_data: Json
          summary?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          audit_data?: Json
          summary?: string | null
          created_at?: string
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
  }
}
