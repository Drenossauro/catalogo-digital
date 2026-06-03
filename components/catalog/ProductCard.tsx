'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, X, Check } from 'lucide-react'
import { Product, ProductVariantOption } from '@/types'
import { useTheme } from './ThemeProvider'

interface Props {
  product: Product
  onAdd: (product: Product, variantLabel?: string) => void
  size?: 'sm' | 'md'
}

export default function ProductCard({ product, onAdd, size = 'md' }: Props) {
  const theme = useTheme()
  const hasVariants = product.variants && product.variants.length > 0
  const [showPicker, setShowPicker] = useState(false)
  const [selected, setSelected] = useState<Record<string, ProductVariantOption>>({})

  function buildVariantLabel() {
    if (!product.variants?.length) return undefined
    const parts = product.variants
      .map((v) => selected[v.id] ? `${v.label}: ${selected[v.id].value}` : null)
      .filter(Boolean)
    return parts.length > 0 ? parts.join(' / ') : undefined
  }

  function computePrice() {
    const extra = Object.values(selected).reduce((sum, o) => sum + (o.price_modifier ?? 0), 0)
    return product.price + extra
  }

  function handleAdd() {
    if (hasVariants) {
      // Verificar variantes obrigatórias
      const missing = product.variants!.filter((v) => v.required && !selected[v.id])
      if (missing.length > 0) return
      onAdd(product, buildVariantLabel())
      setShowPicker(false)
      setSelected({})
    } else {
      onAdd(product)
    }
  }

  const displayPrice = hasVariants ? computePrice() : product.price

  return (
    <div className="flex flex-col relative">
      <div
        className={`relative overflow-hidden rounded-lg ${size === 'sm' ? 'aspect-[3/4] w-36' : 'aspect-[3/4]'}`}
        style={{ background: theme.surface }}
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: theme.textFaint }}>
            <span className="text-3xl">✦</span>
          </div>
        )}
        <button
          onClick={() => hasVariants ? setShowPicker(true) : onAdd(product)}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md cursor-pointer active:scale-95 transition-transform"
          style={{ background: theme.text, color: theme.bg }}
          aria-label="Adicionar"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="pt-2 px-0.5">
        <p className="text-xs leading-snug line-clamp-2" style={{ color: theme.textMuted }}>{product.name}</p>
        <p className="text-sm font-semibold mt-0.5" style={{ color: theme.text }}>
          R$ {displayPrice.toFixed(2).replace('.', ',')}
        </p>
      </div>

      {/* Seletor de variantes */}
      {showPicker && hasVariants && (
        <div
          className="absolute bottom-full left-0 right-0 mb-2 z-30 rounded-lg p-3 shadow-xl"
          style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium" style={{ color: theme.text }}>{product.name}</p>
            <button onClick={() => setShowPicker(false)} style={{ color: theme.textFaint }}>
              <X size={14} />
            </button>
          </div>

          {product.variants!.map((variant) => (
            <div key={variant.id} className="mb-3">
              <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: theme.textMuted }}>
                {variant.label}{variant.required && ' *'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {variant.options.map((opt) => {
                  const isSelected = selected[variant.id]?.value === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSelected((prev) => ({ ...prev, [variant.id]: opt }))}
                      className="px-2 py-1 text-xs rounded cursor-pointer transition-colors"
                      style={
                        isSelected
                          ? { background: theme.text, color: theme.bg }
                          : { background: 'transparent', color: theme.textMuted, border: `1px solid ${theme.border}` }
                      }
                    >
                      {opt.value}
                      {opt.price_modifier > 0 && ` +R$${opt.price_modifier.toFixed(0)}`}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <button
            onClick={handleAdd}
            disabled={product.variants!.some((v) => v.required && !selected[v.id])}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium cursor-pointer rounded transition-opacity disabled:opacity-40"
            style={{ background: theme.text, color: theme.bg }}
          >
            <Check size={13} />
            Adicionar · R$ {computePrice().toFixed(2).replace('.', ',')}
          </button>
        </div>
      )}
    </div>
  )
}
