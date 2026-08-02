import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sxghctohznlmuuyzyaut.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4Z2hjdG9oem5sbXV1eXp5YXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NDM1NTQsImV4cCI6MjA4ODUxOTU1NH0.7p8wjA4lyVApfp8NaLo4RJ0A_7PtyIRjVgG40h-Jpbo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
