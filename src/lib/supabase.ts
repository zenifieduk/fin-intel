import { createClient } from '@supabase/supabase-js'

// Use fallback values during build time when environment variables are not available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// Database query types for TypeScript
export interface PlayerContract {
  id: string
  player_name: string
  position: string
  nationality: string
  club_name: string
  start_date: string
  end_date: string
  base_weekly_wage: number
  bonuses: any
  wage_progressions: any
  appearance_fees: any
  status: string
} 