import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

// Note: This client should ONLY be used in server contexts (Server Actions, API Routes)
// requiring the SUPABASE_SERVICE_ROLE_KEY to be set in environment variables.
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for admin client')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
