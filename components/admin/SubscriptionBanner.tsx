'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function SubscriptionBanner() {
  const { data: session } = useSession()
  const status = session?.user?.subscriptionStatus

  if (status !== 'past_due') return null

  return (
    <div className="bg-orange-50 border-b border-orange-200 px-4 py-2.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-orange-700 text-xs">
        <AlertTriangle size={13} className="shrink-0" />
        <span>
          Seu pagamento está pendente. A loja será suspensa em breve.
        </span>
      </div>
      <Link
        href="/admin/assinatura"
        className="shrink-0 text-xs font-medium text-orange-700 underline underline-offset-2 hover:text-orange-900"
      >
        Regularizar
      </Link>
    </div>
  )
}
