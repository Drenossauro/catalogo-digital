'use client'

import { Category } from '@/types'

interface Props {
  categories: Category[]
  selected: string | null
  onChange: (id: string | null) => void
}

export default function CategoryFilter({ categories, selected, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto px-3 py-2.5" style={{ scrollbarWidth: 'none' }}>
      <button
        onClick={() => onChange(null)}
        className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
          selected === null
            ? 'bg-gray-900 text-white'
            : 'bg-white border border-gray-200 text-gray-600'
        }`}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            selected === cat.id
              ? 'bg-gray-900 text-white'
              : 'bg-white border border-gray-200 text-gray-600'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
