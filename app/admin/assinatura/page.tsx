export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getStoreSubscription, getPlanFeatures } from '@/lib/subscriptions'
import AdminNav from '@/components/admin/AdminNav'
import Link from 'next/link'
import { CreditCard, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  trial: { label: 'Trial', color: 'text-blue-600 bg-blue-50', icon: Clock },
  active: { label: 'Ativa', color: 'text-green-700 bg-green-50', icon: CheckCircle },
  past_due: { label: 'Pagamento pendente', color: 'text-orange-600 bg-orange-50', icon: AlertTriangle },
  cancelled: { label: 'Cancelada', color: 'text-red-600 bg-red-50', icon: AlertTriangle },
  inactive: { label: 'Inativa', color: 'text-red-600 bg-red-50', icon: AlertTriangle },
}

function fmt(date: Date | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function fmtBRL(val: string | null) {
  if (!val) return '—'
  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function AssinaturaPage() {
  const session = await auth()
  if (!session?.user) redirect('/admin/login')

  const storeId = session.user.storeId
  if (!storeId) redirect('/planos')

  const sub = await getStoreSubscription(storeId)

  if (!sub) {
    return (
      <>
        <AdminNav />
        <main className="w-full px-4 py-6 max-w-lg">
          <h1 className="font-serif text-xl text-[#1a1a1a] mb-8">Assinatura</h1>
          <div className="border border-black/10 p-6 text-center">
            <p className="text-sm text-[#1a1a1a]/60 mb-4">Você ainda não tem um plano ativo.</p>
            <Link
              href="/planos"
              className="inline-block bg-[#1a1a1a] text-white text-sm tracking-widest uppercase px-6 py-3 hover:bg-black transition-colors"
            >
              Ver planos
            </Link>
          </div>
        </main>
      </>
    )
  }

  const statusInfo = STATUS_MAP[sub.status] ?? STATUS_MAP['active']
  const StatusIcon = statusInfo.icon
  const features = getPlanFeatures(sub.planFeatures)
  const isTrial = sub.status === 'trial'
  const isPastDue = sub.status === 'past_due'
  const isFree = sub.planSlug === 'free'
  const periodLabel = sub.billingPeriod === 'annual' ? 'Anual' : 'Mensal'

  return (
    <>
      <AdminNav />
      <main className="w-full px-4 py-6 max-w-lg">
        <h1 className="font-serif text-xl text-[#1a1a1a] mb-8">Assinatura</h1>

        {/* Status banner */}
        {isPastDue && (
          <div className="flex items-start gap-3 border border-orange-200 bg-orange-50 p-4 mb-6 text-sm text-orange-700">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Pagamento pendente</p>
              <p className="text-xs mt-1 text-orange-600">
                Regularize sua assinatura para evitar a suspensão da loja.
                {sub.gracePeriodEndsAt && (
                  <> Prazo: {fmt(sub.gracePeriodEndsAt)}.</>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Card da assinatura */}
        <div className="border border-black/10 divide-y divide-black/8">
          {/* Plano + status */}
          <div className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs text-[#1a1a1a]/40 uppercase tracking-wider mb-1">Plano atual</p>
              <p className="font-serif text-lg text-[#1a1a1a]">{sub.planName}</p>
              {!isFree && (
                <p className="text-xs text-[#1a1a1a]/40 mt-0.5">{periodLabel}</p>
              )}
            </div>
            <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full ${statusInfo.color}`}>
              <StatusIcon size={12} />
              {statusInfo.label}
            </span>
          </div>

          {/* Trial info */}
          {isTrial && sub.trialEndsAt && (
            <div className="p-5 flex items-center gap-3">
              <Clock size={16} className="text-blue-500 shrink-0" />
              <div>
                <p className="text-sm text-[#1a1a1a]">Trial encerra em {fmt(sub.trialEndsAt)}</p>
                <p className="text-xs text-[#1a1a1a]/40 mt-0.5">
                  Após essa data, a cobrança será realizada automaticamente.
                </p>
              </div>
            </div>
          )}

          {/* Próxima cobrança */}
          {!isFree && (
            <div className="p-5 flex items-center gap-3">
              <Calendar size={16} className="text-[#1a1a1a]/40 shrink-0" />
              <div>
                <p className="text-xs text-[#1a1a1a]/40 uppercase tracking-wider mb-0.5">Próxima renovação</p>
                <p className="text-sm text-[#1a1a1a]">{fmt(sub.currentPeriodEnd)}</p>
              </div>
            </div>
          )}

          {/* Preço */}
          {!isFree && (
            <div className="p-5 flex items-center gap-3">
              <CreditCard size={16} className="text-[#1a1a1a]/40 shrink-0" />
              <div>
                <p className="text-xs text-[#1a1a1a]/40 uppercase tracking-wider mb-0.5">Valor</p>
                <p className="text-sm text-[#1a1a1a]">
                  {sub.billingPeriod === 'annual'
                    ? `${fmtBRL(sub.priceAnnual)}/ano (${fmtBRL(
                        sub.priceAnnual
                          ? String(Number(sub.priceAnnual) / 12)
                          : null,
                      )}/mês)`
                    : `${fmtBRL(sub.priceMonthly)}/mês`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Limites do plano */}
        <div className="mt-8">
          <p className="text-xs text-[#1a1a1a]/40 uppercase tracking-wider mb-3">Recursos inclusos</p>
          <ul className="grid grid-cols-2 gap-2">
            {[
              { label: 'Produtos', value: features.max_products === null ? 'Ilimitado' : String(features.max_products) },
              { label: 'Categorias', value: features.max_categories === null ? 'Ilimitada' : String(features.max_categories) },
              { label: 'Membros', value: features.max_members === null ? 'Ilimitados' : String(features.max_members) },
              { label: 'Lojas', value: features.max_stores === null ? 'Ilimitadas' : String(features.max_stores) },
              { label: 'Variantes', value: features.has_variants ? 'Sim' : 'Não' },
              { label: 'QR Code', value: features.has_qr_code ? 'Sim' : 'Não' },
            ].map(({ label, value }) => (
              <li key={label} className="border border-black/8 px-3 py-2.5">
                <p className="text-[10px] text-[#1a1a1a]/40 uppercase tracking-wider">{label}</p>
                <p className="text-sm text-[#1a1a1a] font-medium mt-0.5">{value}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Ações */}
        <div className="mt-8 flex flex-col gap-3">
          {!isFree && (
            <Link
              href="/planos"
              className="block text-center border border-black/15 text-[#1a1a1a] text-sm tracking-widest uppercase py-3 hover:bg-black/5 transition-colors"
            >
              Mudar plano
            </Link>
          )}
          {isFree && (
            <Link
              href="/planos"
              className="block text-center bg-[#1a1a1a] text-white text-sm tracking-widest uppercase py-3 hover:bg-black transition-colors"
            >
              Fazer upgrade
            </Link>
          )}
        </div>
      </main>
    </>
  )
}
