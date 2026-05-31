'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  productCount: number
}

interface Props {
  initialCategories: Category[]
}

export default function CategoriasManager({ initialCategories }: Props) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setError(null)
    const res = await fetch('/api/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    if (!res.ok) { setError('Erro ao criar categoria.'); setCreating(false); return }
    const cat = await res.json()
    setCategories((prev) => [...prev, { ...cat, productCount: 0 }])
    setNewName('')
    setCreating(false)
    router.refresh()
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return
    const res = await fetch('/api/categorias', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: editName.trim() }),
    })
    if (!res.ok) { setError('Erro ao renomear.'); return }
    const updated = await res.json()
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name: updated.name } : c))
    setEditingId(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/categorias?id=${id}`, { method: 'DELETE' })
    if (!res.ok) { setError('Erro ao excluir.'); return }
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div className="w-full max-w-lg">
      {/* Create form */}
      <form onSubmit={handleCreate} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome da nova categoria"
          className="flex-1 border-b border-black/15 bg-transparent px-0 py-2.5 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="flex items-center gap-1.5 bg-[#1a1a1a] text-white text-xs tracking-widest uppercase font-medium px-4 py-2.5 hover:bg-black disabled:opacity-40 transition-colors cursor-pointer shrink-0"
        >
          <Plus size={13} />
          Criar
        </button>
      </form>

      {error && <p className="text-xs text-red-400 mb-4">{error}</p>}

      {categories.length === 0 ? (
        <div className="text-center py-16 text-[#1a1a1a]/30">
          <p className="text-sm">Nenhuma categoria ainda.</p>
          <p className="text-xs mt-1">Crie sua primeira categoria acima.</p>
        </div>
      ) : (
        <div className="border-t border-black/8 divide-y divide-black/5">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 py-5">
              {editingId === cat.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRename(cat.id); if (e.key === 'Escape') setEditingId(null) }}
                    autoFocus
                    className="flex-1 border-b border-[#1a1a1a] bg-transparent px-0 py-2 text-sm focus:outline-none"
                  />
                  <button onClick={() => handleRename(cat.id)} className="text-[#1a1a1a]/50 hover:text-[#1a1a1a] cursor-pointer transition-colors p-3">
                    <Check size={18} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-[#1a1a1a]/30 hover:text-[#1a1a1a] cursor-pointer transition-colors p-3">
                    <X size={18} />
                  </button>
                </>
              ) : deletingId === cat.id ? (
                <>
                  <p className="flex-1 text-sm text-[#1a1a1a]">Excluir <strong>{cat.name}</strong>?</p>
                  <button onClick={() => handleDelete(cat.id)} className="text-sm text-red-500 hover:text-red-600 cursor-pointer transition-colors px-4 py-2.5 border border-red-200 rounded">
                    Excluir
                  </button>
                  <button onClick={() => setDeletingId(null)} className="text-sm text-[#1a1a1a]/40 hover:text-[#1a1a1a] cursor-pointer transition-colors px-4 py-2.5">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a]">{cat.name}</p>
                    <p className="text-xs text-[#1a1a1a]/30 mt-0.5">
                      {cat.productCount} {cat.productCount === 1 ? 'produto' : 'produtos'}
                    </p>
                  </div>
                  <button
                    onClick={() => { setEditingId(cat.id); setEditName(cat.name) }}
                    className="text-[#1a1a1a]/30 hover:text-[#1a1a1a] transition-colors cursor-pointer p-3"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => setDeletingId(cat.id)}
                    className="text-[#1a1a1a]/30 hover:text-red-400 transition-colors cursor-pointer p-3"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
