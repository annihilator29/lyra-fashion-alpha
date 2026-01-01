import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EmailPreferencesForm from '@/components/account/EmailPreferencesForm'
import type { EmailPreferences } from '@/types/email'

export default async function EmailPreferencesPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login?redirect=/account/email-preferences')
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('email_preferences')
    .eq('id', user.id)
    .single()

  const preferences: EmailPreferences = (customer?.email_preferences as EmailPreferences) || {
    order_updates: true,
    new_products: false,
    sales: false,
    blog: false,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <EmailPreferencesForm initialPreferences={preferences} />
        </div>
      </div>
    </div>
  )
}
