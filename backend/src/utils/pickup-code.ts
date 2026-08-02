import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

/**
 * Generate unique pickup code in format SF-XXXXXX
 * Retries up to 5 times on collision
 */
export const generatePickupCode = async (): Promise<string> => {
  const maxRetries = 5
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Generate 6 random uppercase alphanumeric characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'SF-'
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    // Check if code already exists
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('pickup_code', code)
      .single()

    // If no match found (error means it doesn't exist), code is unique
    if (error && error.code === 'PGRST116') {
      return code
    }

    // If we got here and it's the last attempt, throw error
    if (attempt === maxRetries - 1) {
      throw new Error('Failed to generate unique pickup code after 5 attempts')
    }
  }

  throw new Error('Failed to generate pickup code')
}

export default generatePickupCode
