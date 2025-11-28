
import { createClient } from '@supabase/supabase-js'
import type { ExtendedDatabase } from './types/extendedDatabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xzckfyipgrgpwnydddev.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Y2tmeWlwZ3JncHdueWRkZGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgwODc2NTMsImV4cCI6MjAxMzY2MzY1M30._EnLLfn0DqX5uC94ZegKtfvz4uZW2bzWQidjqaYUsOo'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<ExtendedDatabase>(supabaseUrl, supabaseAnonKey)

