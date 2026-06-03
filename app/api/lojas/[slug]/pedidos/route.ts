export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { stores, orders, orderItems, products } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/notifications/email'

interface Params { params: Promise<{ slug: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params

  // Verificar que a loja existe e está ativa
  const [store] = await db
    .select({ id: stores.id, whatsappNumber: stores.whatsappNumber, name: stores.name, maxInstallments: stores.maxInstallments })
    .from(stores)
    .where(and(eq(stores.slug, slug), eq(stores.status, 'active')))
    .limit(1)

  if (!store) {
    return NextResponse.json({ error: 'Loja não encontrada ou inativa.' }, { status: 404 })
  }

  const body = await req.json()
  const {
    customerName,
    customerPhone,
    customerAddress,
    notes,
    installments = 1,
    items,
  } = body as {
    customerName: string
    customerPhone: string
    customerAddress?: Record<string, string>
    notes?: string
    installments?: number
    items: { productId: string; quantity: number; variantLabel?: string }[]
  }

  if (!customerName?.trim() || !customerPhone?.trim()) {
    return NextResponse.json({ error: 'Nome e telefone são obrigatórios.' }, { status: 400 })
  }
  if (!items?.length) {
    return NextResponse.json({ error: 'O pedido precisa ter ao menos um item.' }, { status: 400 })
  }

  // Validar produtos e calcular total (com snapshot)
  const productIds = items.map((i) => i.productId)
  const dbProducts = await db
    .select({ id: products.id, name: products.name, price: products.price, storeId: products.storeId })
    .from(products)
    .where(eq(products.storeId, store.id))

  const productMap = new Map(dbProducts.map((p) => [p.id, p]))

  let total = 0
  const resolvedItems = []

  for (const item of items) {
    const p = productMap.get(item.productId)
    if (!p) return NextResponse.json({ error: `Produto ${item.productId} não encontrado.` }, { status: 400 })
    const unitPrice = Number(p.price)
    const subtotal = unitPrice * item.quantity
    total += subtotal
    resolvedItems.push({ ...item, productName: p.name, unitPrice, subtotal })
  }

  // Criar pedido
  const [order] = await db
    .insert(orders)
    .values({
      storeId: store.id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress ?? null,
      notes: notes?.trim() ?? null,
      total: String(total.toFixed(2)),
      status: 'pending',
    })
    .returning()

  // Criar itens do pedido
  await db.insert(orderItems).values(
    resolvedItems.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      productName: item.productName,
      unitPrice: String(item.unitPrice.toFixed(2)),
      quantity: item.quantity,
      variantLabel: item.variantLabel ?? null,
      subtotal: String(item.subtotal.toFixed(2)),
    })),
  )

  // Notificar lojista por e-mail
  sendEmail({
    storeId: store.id,
    type: 'new_order',
    orderNumber: order.id.slice(0, 8).toUpperCase(),
    orderTotal: total,
  }).catch(console.error)

  // Montar mensagem do WhatsApp
  const lines = resolvedItems.map(
    (i) =>
      `• ${i.quantity}x ${i.productName}${i.variantLabel ? ` (${i.variantLabel})` : ''} — R$ ${i.subtotal.toFixed(2).replace('.', ',')}`,
  )
  lines.push(`\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*`)
  if (installments > 1) {
    lines.push(`*Parcelamento: ${installments}x de R$ ${(total / installments).toFixed(2).replace('.', ',')}*`)
  } else {
    lines.push('*Pagamento: à vista*')
  }
  lines.push(`\n_Pedido #${order.id.slice(0, 8).toUpperCase()}_`)

  const message = `Olá! Gostaria de encomendar:\n\n${lines.join('\n')}`
  const whatsappUrl = `https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(message)}`

  return NextResponse.json({ ok: true, orderId: order.id, whatsappUrl })
}

