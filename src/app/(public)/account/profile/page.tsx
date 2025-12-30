import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/account/ProfileForm'
import AvatarUpload from '@/components/account/AvatarUpload'
import PasswordChangeForm from '@/components/account/PasswordChangeForm'
import PreferencesSection from '@/components/account/PreferencesSection'
import DeleteAccountDialog from '@/components/account/DeleteAccountDialog'
import ShippingAddressForm from '@/components/account/ShippingAddressForm'
import ShippingAddressList from '@/components/account/ShippingAddressList'
import type { Customer } from '@/types/database.types'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch customer profile and addresses
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: addresses, error: addressesError } = await supabase
    .from('shipping_addresses')
    .select('*')
    .eq('customer_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })

  if (customerError) {
    console.error('Failed to fetch customer:', customerError)
  }

  if (addressesError) {
    console.error('Failed to fetch addresses:', addressesError)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {/* Basic Profile Information */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <AvatarUpload currentAvatarUrl={customer?.avatar_url} />
            <ProfileForm customer={customer as Customer} />
          </div>
        </div>
      </div>

      {/* Email & Style Preferences */}
      <PreferencesSection customer={customer as Customer} />

      {/* Password Change */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h2 className="text-xl font-semibold mb-4">Password</h2>
        <PasswordChangeForm email={user.email || ''} />
      </div>

      {/* Account Deletion */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200">
        <h2 className="text-xl font-semibold mb-4 text-red-900">Delete Account</h2>
        <p className="text-gray-600 mb-4">
          Once you delete your account, this action cannot be undone.
          Your order history will be retained for legal purposes.
        </p>
        <DeleteAccountDialog />
      </div>

      {/* Shipping Addresses */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h2 className="text-xl font-semibold mb-4">Shipping Addresses</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <ShippingAddressForm />
          </div>
          <div>
            <ShippingAddressList addresses={addresses || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
