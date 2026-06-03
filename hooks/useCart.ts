'use client'

import { useState, useEffect, useCallback } from 'react'
import { Product, CartItem } from '@/types'

// Chave única por produto+variante
function itemKey(productId: string, variantLabel?: string) {
  return `${productId}::${variantLabel ?? ''}`
}

export function useCart(storeSlug?: string | null) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const key = storeSlug ? `vitrine_cart_${storeSlug}` : null

  useEffect(() => {
    if (!key) { setHydrated(true); return }
    try {
      const stored = localStorage.getItem(key)
      if (stored) setCart(JSON.parse(stored))
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true)
  }, [key])

  useEffect(() => {
    if (!hydrated || !key) return
    try {
      localStorage.setItem(key, JSON.stringify(cart))
    } catch {
      // ignore storage errors
    }
  }, [cart, hydrated, key])

  const addToCart = useCallback((product: Product, variantLabel?: string) => {
    setCart((prev) => {
      const k = itemKey(product.id, variantLabel)
      const existing = prev.find((i) => itemKey(i.product.id, i.variantLabel) === k)
      if (existing) {
        return prev.map((i) =>
          itemKey(i.product.id, i.variantLabel) === k ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, { product, quantity: 1, variantLabel }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string, variantLabel?: string) => {
    const k = itemKey(productId, variantLabel)
    setCart((prev) => prev.filter((i) => itemKey(i.product.id, i.variantLabel) !== k))
  }, [])

  const changeQty = useCallback((productId: string, delta: number, variantLabel?: string) => {
    const k = itemKey(productId, variantLabel)
    setCart((prev) =>
      prev
        .map((i) => itemKey(i.product.id, i.variantLabel) === k ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0),
    )
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0)

  return { cart, hydrated, addToCart, removeFromCart, changeQty, clearCart, totalItems }
}
