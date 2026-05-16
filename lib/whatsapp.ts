import { CartItem } from '@/types'

export function buildWhatsAppMessage(items: CartItem[], installments: number, installmentValue: number): string {
  const lines = items.map(
    ({ product, quantity }) =>
      `• ${quantity}x ${product.name} — R$ ${(product.price * quantity).toFixed(2).replace('.', ',')}`
  )
  const total = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)

  lines.push(`\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*`)

  if (installments > 1) {
    lines.push(`*Parcelamento: ${installments}x de R$ ${installmentValue.toFixed(2).replace('.', ',')}*`)
  } else {
    lines.push(`*Pagamento: à vista*`)
  }

  return `Olá! Gostaria de encomendar:\n\n${lines.join('\n')}`
}

export function buildWhatsAppUrl(message: string, whatsappNumber: string): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}
