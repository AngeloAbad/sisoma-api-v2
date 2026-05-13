import { createClient } from '@supabase/supabase-js'

const URL  = import.meta.env.VITE_SUPABASE_URL
const KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (URL && KEY)
  ? createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true } })
  : null

export const isConfigured = Boolean(URL && KEY)
