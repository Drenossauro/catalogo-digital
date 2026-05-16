'use client'

import Image from 'next/image'
import { Plus } from 'lucide-react'
import { Product } from '@/types'

interface Props {
  product: Product
  onAdd: (product: Product) => void
  size?: 'sm' | 'md'
}

export default function ProductCard({ product, onAdd, size = 'md' }: Props) {
  return (
    <div className="flex flex-col group">
      {/* imagem */}
      <div className={`relative bg-[#F0EDE8] overflow-hidden rounded-lg ${size === 'sm' ? 'aspect-[3/4] w-36' : 'aspect-[3/4]'}`}>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl opacity-20">✦</span>
          </div>
        )}
        {/* botão add flutuante */}
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(product) }}
          className="absolute bottom-2 right-2 w-8 h-8 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
          aria-label="Adicionar"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* info */}
      <div className="pt-2 px-0.5">
        <p className="text-xs text-[#1a1a1a]/70 leading-snug line-clamp-2">{product.name}</p>
        <p className="text-sm font-semibold mt-0.5">R$ {product.price.toFixed(2).replace('.', ',')}</p>
      </div>

    </div>
  )
}
