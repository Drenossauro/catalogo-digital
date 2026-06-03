import { db } from '@/lib/db'
import { stores, storeMembers, users, notifications } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// ---------------------------------------------------------------------------
// Tipos de notificação suportados
// ---------------------------------------------------------------------------
type NotificationType =
  | 'subscription_trial_ending'
  | 'subscription_past_due'
  | 'subscription_inactive'
  | 'subscription_reactivated'
  | 'new_order'
  | 'invite_received'

interface EmailPayload {
  storeId?: string
  userId?: string
  type: NotificationType
  // Dados extras por tipo
  graceDaysLeft?: number
  orderTotal?: number
  orderNumber?: string
  inviteToken?: string
  inviterName?: string
}

// ---------------------------------------------------------------------------
// Busca o e-mail do lojista (owner) de uma loja
// ---------------------------------------------------------------------------
async function getOwnerEmail(storeId: string): Promise<{ email: string; name: string } | null> {
  const [row] = await db
    .select({ email: users.email, name: users.name })
    .from(storeMembers)
    .innerJoin(users, eq(users.id, storeMembers.userId))
    .where(and(eq(storeMembers.storeId, storeId), eq(storeMembers.role, 'lojista')))
    .limit(1)

  return row ?? null
}

// ---------------------------------------------------------------------------
// Busca o nome da loja
// ---------------------------------------------------------------------------
async function getStoreName(storeId: string): Promise<string> {
  const [row] = await db
    .select({ name: stores.name })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1)

  return row?.name ?? 'Sua loja'
}

// ---------------------------------------------------------------------------
// Templates de e-mail
// ---------------------------------------------------------------------------
function buildSubject(type: NotificationType, storeName: string): string {
  const subjects: Record<NotificationType, string> = {
    subscription_trial_ending: `[Vitrine] Seu trial de ${storeName} está acabando`,
    subscription_past_due: `[Vitrine] Pagamento pendente — ${storeName}`,
    subscription_inactive: `[Vitrine] Sua loja ${storeName} foi suspensa`,
    subscription_reactivated: `[Vitrine] Sua loja ${storeName} está ativa novamente!`,
    new_order: `[Vitrine] Novo pedido em ${storeName}`,
    invite_received: `[Vitrine] Você foi convidado para gerenciar ${storeName}`,
  }
  return subjects[type]
}

function buildHtml(type: NotificationType, data: {
  name: string
  storeName: string
  graceDaysLeft?: number
  orderTotal?: number
  orderNumber?: string
  inviteToken?: string
  inviterName?: string
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vitrine.app'
  const { name, storeName } = data

  const base = (content: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:sans-serif">
<div style="max-width:480px;margin:40px auto;background:#fff;border:1px solid #e8e5e0;padding:40px">
  <div style="text-align:center;margin-bottom:32px">
    <div style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:#1a1a1a">
      <span style="color:#FAF8F5;font-size:18px">✦</span>
    </div>
    <h1 style="font-family:Georgia,serif;font-size:20px;color:#1a1a1a;margin:12px 0 0">Vitrine</h1>
  </div>
  ${content}
  <hr style="border:none;border-top:1px solid #e8e5e0;margin:32px 0">
  <p style="font-size:11px;color:#999;text-align:center">
    Vitrine · Catálogo Digital · <a href="${appUrl}" style="color:#999">${appUrl}</a>
  </p>
</div>
</body>
</html>`

  const btn = (href: string, label: string) =>
    `<a href="${href}" style="display:block;background:#1a1a1a;color:#fff;text-align:center;padding:14px 24px;font-size:13px;text-transform:uppercase;letter-spacing:2px;text-decoration:none;margin-top:24px">${label}</a>`

  switch (type) {
    case 'subscription_past_due':
      return base(`
        <p style="font-size:15px;color:#1a1a1a">Olá, ${name}!</p>
        <p style="font-size:14px;color:#555;line-height:1.6">
          O pagamento da assinatura de <strong>${storeName}</strong> está pendente.
          Você tem <strong>${data.graceDaysLeft ?? 3} dia(s)</strong> para regularizar antes de
          a loja ser suspensa.
        </p>
        ${btn(`${appUrl}/admin/assinatura`, 'Regularizar assinatura')}`)

    case 'subscription_inactive':
      return base(`
        <p style="font-size:15px;color:#1a1a1a">Olá, ${name}!</p>
        <p style="font-size:14px;color:#555;line-height:1.6">
          Sua loja <strong>${storeName}</strong> foi suspensa por falta de pagamento.
          Regularize sua assinatura para reativar o catálogo.
        </p>
        ${btn(`${appUrl}/admin/assinatura`, 'Reativar loja')}`)

    case 'subscription_reactivated':
      return base(`
        <p style="font-size:15px;color:#1a1a1a">Olá, ${name}!</p>
        <p style="font-size:14px;color:#555;line-height:1.6">
          Ótima notícia! Sua loja <strong>${storeName}</strong> está ativa novamente.
        </p>
        ${btn(`${appUrl}/admin/dashboard`, 'Acessar painel')}`)

    case 'new_order':
      return base(`
        <p style="font-size:15px;color:#1a1a1a">Novo pedido!</p>
        <p style="font-size:14px;color:#555;line-height:1.6">
          <strong>${storeName}</strong> recebeu um novo pedido
          ${data.orderNumber ? `#${data.orderNumber}` : ''}
          ${data.orderTotal !== undefined ? ` no valor de R$ ${data.orderTotal.toFixed(2).replace('.', ',')}` : ''}.
        </p>
        ${btn(`${appUrl}/admin/pedidos`, 'Ver pedidos')}`)

    case 'invite_received':
      return base(`
        <p style="font-size:15px;color:#1a1a1a">Olá!</p>
        <p style="font-size:14px;color:#555;line-height:1.6">
          ${data.inviterName ? `<strong>${data.inviterName}</strong>` : 'Alguém'} convidou você para gerenciar
          <strong>${storeName}</strong> no Vitrine.
        </p>
        ${btn(`${appUrl}/convite/${data.inviteToken}`, 'Aceitar convite')}`)

    case 'subscription_trial_ending':
      return base(`
        <p style="font-size:15px;color:#1a1a1a">Olá, ${name}!</p>
        <p style="font-size:14px;color:#555;line-height:1.6">
          Seu período de trial de <strong>${storeName}</strong> está chegando ao fim.
          Certifique-se de que seus dados de pagamento estão atualizados.
        </p>
        ${btn(`${appUrl}/admin/assinatura`, 'Verificar assinatura')}`)

    default:
      return base(`<p style="font-size:14px;color:#555">Olá, ${name}! Acesse o painel para mais detalhes.</p>`)
  }
}

// ---------------------------------------------------------------------------
// Envio via Mailtrap API
// ---------------------------------------------------------------------------
export async function subjectFor(type: NotificationType, storeName: string) {
  return buildSubject(type, storeName)
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const token = process.env.MAILTRAP_TOKEN
  const fromEmail = process.env.MAILTRAP_FROM_EMAIL ?? 'noreply@vitrine.app'

  if (!token) {
    console.warn('[email] MAILTRAP_TOKEN não configurado — e-mail não enviado')
    return
  }

  // Resolver destinatário
  let recipientEmail: string | null = null
  let recipientName = 'Lojista'
  let storeName = 'Sua loja'

  if (payload.storeId) {
    const owner = await getOwnerEmail(payload.storeId)
    if (owner) {
      recipientEmail = owner.email
      recipientName = owner.name
    }
    storeName = await getStoreName(payload.storeId)
  } else if (payload.userId) {
    const [u] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1)
    if (u) { recipientEmail = u.email; recipientName = u.name }
  }

  if (!recipientEmail) {
    console.warn('[email] Destinatário não encontrado:', payload)
    return
  }

  const subject = buildSubject(payload.type, storeName)
  const html = buildHtml(payload.type, {
    name: recipientName,
    storeName,
    graceDaysLeft: payload.graceDaysLeft,
    orderTotal: payload.orderTotal,
    orderNumber: payload.orderNumber,
    inviteToken: payload.inviteToken,
    inviterName: payload.inviterName,
  })

  // Registrar tentativa no log
  const [notif] = await db
    .insert(notifications)
    .values({
      userId: payload.userId,
      storeId: payload.storeId,
      type: payload.type,
      channel: 'email',
      status: 'pending',
      payload: { to: recipientEmail, subject, ...payload } as Record<string, unknown>,
    })
    .returning({ id: notifications.id })

  // Chamar Mailtrap API
  const res = await fetch('https://send.api.mailtrap.io/api/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: 'Vitrine' },
      to: [{ email: recipientEmail, name: recipientName }],
      subject,
      html,
    }),
  })

  const status = res.ok ? 'sent' : 'failed'
  await db
    .update(notifications)
    .set({ status, sentAt: new Date() })
    .where(eq(notifications.id, notif.id))

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error('[email] Falha ao enviar:', status, body)
  }
}
