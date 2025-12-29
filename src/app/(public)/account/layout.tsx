import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Account - Lyra Fashion',
  description: 'View your account settings and order history',
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
