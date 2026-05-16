'use client'

import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import { Product } from '@/types'

interface Props {
  product: Product
  onAdd: (product: Product) => void
}

export default function ProductCard({ product, onAdd }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-gray-50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingBag size={48} />
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">{product.name}</p>
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-base font-bold text-gray-900">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          <button
            onClick={() => onAdd(product)}
            className="flex items-center gap-1 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-gray-700 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag size={13} />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}
