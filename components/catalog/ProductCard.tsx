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
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
      <div className="relative aspect-[3/2] bg-gray-50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={28} className="text-gray-200" />
          </div>
        )}
      </div>

      <div className="p-2.5 flex flex-col gap-2 flex-1">
        <p className="text-xs sm:text-sm font-medium text-gray-800 leading-snug line-clamp-2">
          {product.name}
        </p>
        <div className="mt-auto flex flex-col gap-1.5">
          <span className="text-sm font-bold text-gray-900">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          <button
            onClick={() => onAdd(product)}
            className="w-full flex items-center justify-center gap-1 bg-gray-900 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-gray-700 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag size={11} />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}
