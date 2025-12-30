import { type Metadata } from 'next'
import AccountSidebar from '@/components/account/AccountSidebar'

export const metadata: Metadata = {
  title: 'My Account - Lyra Fashion',
  description: 'View your account settings and order history',
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AccountSidebar />
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
