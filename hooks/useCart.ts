'use client'

import { useState, useEffect, useCallback } from 'react'
import { Product, CartItem } from '@/types'

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

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const changeQty = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    )
  }, [])

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0)

  return { cart, hydrated, addToCart, removeFromCart, changeQty, totalItems }
}
