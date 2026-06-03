'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Shield } from 'lucide-react'

interface Plan {
  id: string
  name: string
  slug: string
  trialDays: number
}

interface Props {
  plan: Plan
  billingPeriod: 'monthly' | 'annual'
  amount: number
  mpPublicKey: string
  userEmail: string
}

declare global {
  interface Window {
    MercadoPago: new (key: string, opts: { locale: string }) => {
      bricks: () => {
        create: (
          type: string,
          container: string,
          settings: Record<string, unknown>,
        ) => Promise<unknown>
      }
    }
  }
}

export default function CheckoutClient({ plan, billingPeriod, amount, mpPublicKey, userEmail }: Props) {
  const router = useRouter()
  const brickRendered = useRef(false)
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const periodLabel = billingPeriod === 'annual' ? 'Anual' : 'Mensal'
  const amountFmt = amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  useEffect(() => {
    if (!sdkLoaded || brickRendered.current || !mpPublicKey) return
    brickRendered.current = true

    const mp = new window.MercadoPago(mpPublicKey, { locale: 'pt-BR' })
    const bricks = mp.bricks()

    bricks.create('cardPayment', '#mp-brick-container', {
      initialization: {
        amount,
        payer: { email: userEmail },
      },
      customization: {
        paymentMethods: { maxInstallments: 1 },
        visual: {
          hideFormTitle: true,
          style: {
            customVariables: {
              textPrimaryColor: '#1a1a1a',
              textSecondaryColor: 'rgba(26,26,26,0.5)',
              inputBackgroundColor: 'transparent',
              formBackgroundColor: '#FAF8F5',
              baseColor: '#1a1a1a',
            },
          },
        },
      },
      callbacks: {
        onReady: () => {},
        onError: (err: unknown) => {
          console.error('[MP Brick]', err)
          setError('Erro ao carregar formulário de pagamento.')
        },
        onSubmit: async (mpFormData: Record<string, unknown>) => {
          setProcessing(true)
          setError(null)
          try {
            const res = await fetch('/api/assinatura/criar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                planSlug: plan.slug,
                billingPeriod,
                mpFormData,
              }),
            })
            const data = await res.json()
            if (res.ok && data.ok) {
              router.push('/admin/dashboard')
            } else {
              setError(data.error ?? 'Falha ao processar pagamento.')
              setProcessing(false)
            }
          } catch {
            setError('Erro de conexão. Tente novamente.')
            setProcessing(false)
          }
        },
      },
    })
  }, [sdkLoaded, amount, billingPeriod, mpPublicKey, plan.slug, router, userEmail])

  return (
    <>
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="afterInteractive"
        onLoad={() => setSdkLoaded(true)}
        onError={() => setError('Erro ao carregar SDK do Mercado Pago.')}
      />

      <div className="min-h-screen bg-[#FAF8F5] px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Voltar */}
          <Link
            href="/planos"
            className="inline-flex items-center gap-1 text-sm text-[#1a1a1a]/40 hover:text-[#1a1a1a] mb-8 transition-colors"
          >
            <ChevronLeft size={15} /> Voltar aos planos
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-2xl text-[#1a1a1a] mb-1">Finalizar assinatura</h1>
            <p className="text-sm text-[#1a1a1a]/50">
              Plano {plan.name} · {periodLabel} · {amountFmt}
              {plan.trialDays > 0 && (
                <span className="ml-2 text-green-700 font-medium">
                  ({plan.trialDays} dias grátis)
                </span>
              )}
            </p>
          </div>

          {/* Brick container */}
          <div className="mb-6">
            {!sdkLoaded && !error && (
              <div className="h-48 flex items-center justify-center">
                <p className="text-sm text-[#1a1a1a]/40">Carregando formulário...</p>
              </div>
            )}
            <div id="mp-brick-container" />
          </div>

          {error && (
            <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
          )}

          {processing && (
            <p className="text-sm text-[#1a1a1a]/50 text-center">Processando assinatura...</p>
          )}

          {/* Segurança */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-[#1a1a1a]/30">
            <Shield size={12} />
            <span>Pagamento seguro via Mercado Pago · Cancele quando quiser</span>
          </div>
        </div>
      </div>
    </>
  )
}
