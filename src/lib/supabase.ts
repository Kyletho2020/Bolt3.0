/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oorgoezqxexsewcwasvh.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcmdvZXpxeGV4c2V3Y3dhc3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTU0NzUsImV4cCI6MjA2ODI5MTQ3NX0.PLGUswNkjeNbbOOEsD7MpLuCY0HSwUMAGO3Q-IPAfjw'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface TempQuoteData {
  id?: string
  session_id: string
  equipment_data?: any
  logistics_data?: any
  created_at?: string
  updated_at?: string
}
