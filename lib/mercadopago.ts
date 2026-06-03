import MercadoPagoConfig, { PreApproval } from 'mercadopago'
import crypto from 'crypto'

// ---------------------------------------------------------------------------
// Singleton do cliente MP (server-side only)
// ---------------------------------------------------------------------------
let _client: MercadoPagoConfig | null = null

function getClient(): MercadoPagoConfig {
  if (!_client) {
    if (!process.env.MP_ACCESS_TOKEN) {
      throw new Error('MP_ACCESS_TOKEN não configurado no .env.local')
    }
    _client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
  }
  return _client
}

export function getPreApprovalClient() {
  return new PreApproval(getClient())
}

// ---------------------------------------------------------------------------
// Criação de preapproval (assinatura recorrente)
// ---------------------------------------------------------------------------
export interface CreatePreApprovalParams {
  payerEmail: string
  cardTokenId: string
  planName: string
  amountBRL: number
  trialDays?: number
  backUrl: string
}

export async function createPreApproval(params: CreatePreApprovalParams) {
  const pa = getPreApprovalClient()

  const autoRecurring = {
    frequency: 1,
    frequency_type: 'months' as const,
    transaction_amount: params.amountBRL,
    currency_id: 'BRL',
    ...(params.trialDays && params.trialDays > 0
      ? { free_trial: { frequency: params.trialDays, frequency_type: 'days' as const } }
      : {}),
  }

  const body = {
    payer_email: params.payerEmail,
    card_token_id: params.cardTokenId,
    reason: `Vitrine — ${params.planName}`,
    auto_recurring: autoRecurring,
    back_url: params.backUrl,
    status: 'authorized' as const,
  }

  const result = await pa.create({ body })
  return result
}

// ---------------------------------------------------------------------------
// Validação de assinatura HMAC do webhook
// ---------------------------------------------------------------------------
export function validateWebhookSignature(
  signatureHeader: string | null,
  requestId: string | null,
  notificationId: string | null,
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret || !signatureHeader || !requestId || !notificationId) return false

  // Header format: "ts=<timestamp>,v1=<hash>"
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => p.split('=')),
  )
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  const manifest = `id:${notificationId};request-date:${ts};`
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected))
}
