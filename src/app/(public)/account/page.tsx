import { redirect } from 'next/navigation'

export default function AccountPage() {
  // Redirect to account dashboard
  redirect('/account/dashboard')
}
