import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { plans } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import CheckoutClient from './CheckoutClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Checkout · Vitrine' }

interface Props {
  searchParams: Promise<{ plan?: string; period?: string }>
}

export default async function CheckoutPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/admin/login?callbackUrl=/planos')

  const { plan: planSlug = 'pro', period = 'monthly' } = await searchParams

  const [plan] = await db
    .select()
    .from(plans)
    .where(eq(plans.slug, planSlug))
    .limit(1)

  if (!plan || plan.slug === 'free') redirect('/planos')

  const billingPeriod = period === 'annual' ? 'annual' : 'monthly'
  const amount =
    billingPeriod === 'annual'
      ? Number(plan.priceAnnual ?? plan.priceMonthly)
      : Number(plan.priceMonthly)

  const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? ''

  return (
    <CheckoutClient
      plan={{ id: plan.id, name: plan.name, slug: plan.slug, trialDays: plan.trialDays }}
      billingPeriod={billingPeriod}
      amount={amount}
      mpPublicKey={publicKey}
      userEmail={session.user.email ?? ''}
    />
  )
}
