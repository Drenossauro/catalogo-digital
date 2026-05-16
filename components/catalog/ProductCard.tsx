'use client'

import Image from 'next/image'
import { Plus } from 'lucide-react'
import { Product } from '@/types'
import { useTheme } from './ThemeProvider'

interface Props {
  product: Product
  onAdd: (product: Product) => void
  size?: 'sm' | 'md'
}

export default function ProductCard({ product, onAdd, size = 'md' }: Props) {
  const theme = useTheme()

  return (
    <div className="flex flex-col">
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
          onClick={() => onAdd(product)}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          style={{ background: theme.text, color: theme.bg }}
          aria-label="Adicionar"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="pt-2 px-0.5">
        <p className="text-xs leading-snug line-clamp-2" style={{ color: theme.textMuted }}>{product.name}</p>
        <p className="text-sm font-semibold mt-0.5" style={{ color: theme.text }}>
          R$ {product.price.toFixed(2).replace('.', ',')}
        </p>
      </div>
    </div>
  )
}
