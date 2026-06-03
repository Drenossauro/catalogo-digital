import type { Metadata } from 'next'
import SubscriptionBanner from '@/components/admin/SubscriptionBanner'
import Toaster from '@/components/ui/Toaster'

export const metadata: Metadata = {
  title: 'Admin — Vitrine',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-16 sm:pb-0">
      <SubscriptionBanner />
      {children}
      <Toaster />
    </div>
  )
}
