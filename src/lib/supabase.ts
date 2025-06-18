import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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