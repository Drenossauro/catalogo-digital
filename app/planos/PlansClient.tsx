'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Check } from 'lucide-react'

interface Plan {
  id: string
  name: string
  slug: string
  priceMonthly: string
  priceAnnual: string | null
  trialDays: number
  features: unknown
}

interface PlanFeatures {
  max_products?: number | null
  max_categories?: number | null
  max_members?: number | null
  max_stores?: number | null
  has_variants?: boolean
  has_qr_code?: boolean
  has_custom_domain?: boolean
}

function getFeatures(raw: unknown): PlanFeatures {
  if (raw && typeof raw === 'object') return raw as PlanFeatures
  return {}
}

function featureLabel(key: keyof PlanFeatures, val: PlanFeatures[typeof key]): string {
  if (val === null || val === undefined) return ''
  switch (key) {
    case 'max_products': return val === null ? 'Produtos ilimitados' : `Até ${val} produtos`
    case 'max_categories': return val === null ? 'Categorias ilimitadas' : `Até ${val} categorias`
    case 'max_members': return val === null ? 'Membros ilimitados' : `Até ${val as number} membro${(val as number) > 1 ? 's' : ''}`
    case 'max_stores': return val === null ? 'Lojas ilimitadas' : `${val} loja${(val as number) > 1 ? 's' : ''}`
    case 'has_variants': return val ? 'Variantes de produto' : ''
    case 'has_qr_code': return val ? 'QR code da loja' : ''
    case 'has_custom_domain': return val ? 'Domínio customizado' : ''
    default: return ''
  }
}

const FEATURE_ORDER: (keyof PlanFeatures)[] = [
  'max_products', 'max_categories', 'max_members', 'max_stores',
  'has_variants', 'has_qr_code', 'has_custom_domain',
]

export default function PlansClient({ plans }: { plans: Plan[] }) {
  const [annual, setAnnual] = useState(false)
  const [loadingFree, setLoadingFree] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  async function handleFreeStart() {
    if (!session) { router.push('/cadastro'); return }
    setLoadingFree(true)
    const res = await fetch('/api/assinatura/criar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planSlug: 'free', billingPeriod: 'monthly' }),
    })
    const data = await res.json()
    if (res.ok && data.redirect) router.push(data.redirect)
    else setLoadingFree(false)
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1a1a1a] mb-6">
            <span className="font-serif text-base text-[#FAF8F5] leading-none">✦</span>
          </div>
          <h1 className="font-serif text-4xl tracking-wide text-[#1a1a1a] mb-3">
            Escolha seu plano
          </h1>
          <p className="text-sm text-[#1a1a1a]/50">
            Comece grátis. Faça upgrade quando precisar.
          </p>
        </div>

        {/* Toggle mensal/anual */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={`text-sm ${!annual ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]/40'}`}>
            Mensal
          </span>
          <button
            onClick={() => setAnnual((v) => !v)}
            className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer ${annual ? 'bg-[#1a1a1a]' : 'bg-black/20'}`}
            style={{ height: '22px' }}
            aria-label="Alternar anual/mensal"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform ${annual ? 'translate-x-4.5' : ''}`}
              style={{ width: '18px', height: '18px', transform: annual ? 'translateX(18px)' : 'none' }}
            />
          </button>
          <span className={`text-sm ${annual ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]/40'}`}>
            Anual
            <span className="ml-1.5 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium uppercase tracking-wide">
              ~2 meses grátis
            </span>
          </span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const features = getFeatures(plan.features)
            const price = annual && plan.priceAnnual
              ? Number(plan.priceAnnual)
              : Number(plan.priceMonthly)
            const pricePerMonth = annual && plan.priceAnnual
              ? Number(plan.priceAnnual) / 12
              : Number(plan.priceMonthly)
            const isFree = plan.slug === 'free'
            const isPro = plan.slug === 'pro'
            const checkoutUrl = isFree
              ? null
              : `/checkout?plan=${plan.slug}&period=${annual ? 'annual' : 'monthly'}`

            return (
              <div
                key={plan.id}
                className={`relative border p-6 flex flex-col ${
                  isPro
                    ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                    : 'border-black/12 bg-white text-[#1a1a1a]'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/20 text-white text-[10px] uppercase tracking-widest px-3 py-1">
                    Popular
                  </div>
                )}

                <div className="mb-6">
                  <h2 className={`font-serif text-xl mb-1 ${isPro ? 'text-white' : 'text-[#1a1a1a]'}`}>
                    {plan.name}
                  </h2>
                  {isFree ? (
                    <div>
                      <span className={`text-3xl font-serif ${isPro ? 'text-white' : 'text-[#1a1a1a]'}`}>
                        Grátis
                      </span>
                    </div>
                  ) : (
                    <div>
                      {annual && plan.priceAnnual && (
                        <p className={`text-xs mb-1 ${isPro ? 'text-white/50' : 'text-[#1a1a1a]/40'}`}>
                          R$ {price.toFixed(0).replace('.', ',')}/ano
                        </p>
                      )}
                      <span className={`text-3xl font-serif ${isPro ? 'text-white' : 'text-[#1a1a1a]'}`}>
                        R$ {pricePerMonth.toFixed(2).replace('.', ',')}
                      </span>
                      <span className={`text-xs ml-1 ${isPro ? 'text-white/50' : 'text-[#1a1a1a]/40'}`}>
                        /mês
                      </span>
                    </div>
                  )}
                  {plan.trialDays > 0 && (
                    <p className={`text-xs mt-1.5 ${isPro ? 'text-white/60' : 'text-[#1a1a1a]/40'}`}>
                      {plan.trialDays} dias grátis, sem cartão agora
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-2.5 flex-1 mb-8">
                  {FEATURE_ORDER.map((key) => {
                    const val = features[key]
                    if (val === false || val === undefined) return null
                    const label = featureLabel(key, val)
                    if (!label) return null
                    return (
                      <li key={key} className="flex items-start gap-2">
                        <Check
                          size={14}
                          className={`shrink-0 mt-0.5 ${isPro ? 'text-white/60' : 'text-[#1a1a1a]/40'}`}
                        />
                        <span className={`text-sm ${isPro ? 'text-white/80' : 'text-[#1a1a1a]/70'}`}>
                          {label}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                {/* CTA */}
                {isFree ? (
                  <button
                    onClick={handleFreeStart}
                    disabled={loadingFree}
                    className="block w-full text-center py-3 text-sm tracking-widest uppercase font-medium border border-black/20 text-[#1a1a1a] hover:bg-black/5 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {loadingFree ? 'Aguarde...' : 'Começar grátis'}
                  </button>
                ) : (
                  <Link
                    href={`/cadastro?next=${encodeURIComponent(checkoutUrl!)}`}
                    className={`block text-center py-3 text-sm tracking-widest uppercase font-medium transition-colors ${
                      isPro
                        ? 'bg-white text-[#1a1a1a] hover:bg-white/90'
                        : 'bg-[#1a1a1a] text-white hover:bg-black'
                    }`}
                  >
                    {plan.trialDays > 0 ? `Testar ${plan.trialDays} dias` : 'Assinar'}
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-[#1a1a1a]/30 mt-10">
          Cancele quando quiser · Sem taxa de adesão
        </p>
      </div>
    </div>
  )
}
