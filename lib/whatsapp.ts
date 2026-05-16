import { CartItem } from '@/types'

export function buildWhatsAppMessage(items: CartItem[]): string {
  const lines = items.map(
    ({ product, quantity }) =>
      `• ${quantity}x ${product.name} — R$ ${(product.price * quantity).toFixed(2).replace('.', ',')}`
  )
  const total = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)
  lines.push(`\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*`)
  return `Olá! Gostaria de encomendar:\n\n${lines.join('\n')}`
}

export function buildWhatsAppUrl(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
