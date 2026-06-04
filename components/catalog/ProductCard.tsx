'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, X, Check } from 'lucide-react'
import { Product, ProductVariantOption } from '@/types'
import { useTheme } from './ThemeProvider'

interface Props {
  product: Product
  onAdd: (product: Product, variantLabel?: string) => void
  size?: 'sm' | 'md'
  storeSlug?: string | null
}

export default function ProductCard({ product, onAdd, size = 'md', storeSlug }: Props) {
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
  const productHref = storeSlug ? `/loja/${storeSlug}/produto/${product.id}` : null

  const ImageWrapper = ({ children }: { children: React.ReactNode }) =>
    productHref ? (
      <Link href={productHref} className="block">
        {children}
      </Link>
    ) : (
      <div>{children}</div>
    )

  return (
    <div className="flex flex-col relative group">
      {/* Imagem */}
      <ImageWrapper>
        <div
          className={`relative overflow-hidden ${size === 'sm' ? 'aspect-[3/4] w-40 rounded-xl' : 'aspect-[3/4] rounded-xl'}`}
          style={{ background: theme.surface }}
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: theme.textFaint }}>
              <span className="text-4xl font-serif">✦</span>
            </div>
          )}

          {/* Botão adicionar */}
          <button
            onClick={(e) => { e.preventDefault(); hasVariants ? setShowPicker(true) : onAdd(product) }}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg cursor-pointer active:scale-90 transition-all duration-200 opacity-90 hover:opacity-100"
            style={{ background: theme.text, color: theme.bg }}
            aria-label="Adicionar ao carrinho"
          >
            <Plus size={15} strokeWidth={2} />
          </button>
        </div>
      </ImageWrapper>

      {/* Texto */}
      <div className="pt-2.5 px-0.5 flex flex-col gap-0.5">
        {productHref ? (
          <Link href={productHref} className="text-[13px] leading-snug line-clamp-2 font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>
            {product.name}
          </Link>
        ) : (
          <p className="text-[13px] leading-snug line-clamp-2 font-medium" style={{ color: theme.text }}>
            {product.name}
          </p>
        )}
        <p
          className="text-sm font-semibold"
          style={{ color: theme.accent }}
        >
          R$ {displayPrice.toFixed(2).replace('.', ',')}
        </p>
      </div>

      {/* Seletor de variantes */}
      {showPicker && hasVariants && (
        <div
          className="absolute bottom-full left-0 right-0 mb-2 z-30 rounded-xl p-4 shadow-2xl"
          style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium tracking-wide" style={{ color: theme.text }}>
              {product.name}
            </p>
            <button onClick={() => setShowPicker(false)} style={{ color: theme.textFaint }}>
              <X size={14} />
            </button>
          </div>

          {product.variants!.map((variant) => (
            <div key={variant.id} className="mb-3">
              <p
                className="text-[10px] uppercase tracking-widest mb-2"
                style={{ color: theme.textMuted }}
              >
                {variant.label}{variant.required && ' *'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {variant.options.map((opt) => {
                  const isSelected = selected[variant.id]?.value === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSelected((prev) => ({ ...prev, [variant.id]: opt }))}
                      className="px-3 py-1.5 text-xs rounded-full cursor-pointer transition-all"
                      style={
                        isSelected
                          ? { background: theme.text, color: theme.bg, border: `1px solid ${theme.text}` }
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
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium cursor-pointer rounded-lg transition-opacity disabled:opacity-40 mt-1"
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
