'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Camera, Trash2, Loader2 } from 'lucide-react'
import { Category } from '@/types'

type ProductRow = {
  id: string
  name: string
  description: string | null
  price: string | number
  categoryId: string | null
  imageUrl: string | null
  active: boolean
}

interface Props {
  categories: Category[]
  product?: ProductRow
}

export default function ProductForm({ categories, product }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price ?? '')
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '')
  const [active, setActive] = useState(product?.active ?? true)
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    if (!res.ok) { setError('Erro ao fazer upload da imagem.'); setUploading(false); return }
    const { url } = await res.json()
    setImageUrl(url)
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const payload = { id: product?.id, name, description: description || null, price, categoryId: categoryId || null, active, imageUrl: imageUrl || null }
    const res = await fetch('/api/produtos', { method: product ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) { setError('Erro ao salvar produto.'); setSaving(false); return }
    router.push('/admin/dashboard')
    router.refresh()
  }

  async function handleDelete() {
    if (!product || !confirm('Tem certeza que deseja excluir este produto?')) return
    await fetch(`/api/produtos?id=${product.id}`, { method: 'DELETE' })
    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">

      {/* Imagem */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">Foto do produto</span>
        <div
          onClick={() => fileRef.current?.click()}
          className="relative w-full aspect-[4/3] sm:aspect-[3/2] max-w-sm rounded-xl overflow-hidden bg-[#F0EDE8] flex items-center justify-center cursor-pointer group"
        >
          {imageUrl ? (
            <>
              <Image src={imageUrl} alt="Produto" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={24} className="text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-[#1a1a1a]/30">
              {uploading ? (
                <Loader2 size={28} className="animate-spin" />
              ) : (
                <>
                  <Camera size={28} strokeWidth={1.5} />
                  <span className="text-xs">Toque para adicionar foto</span>
                </>
              )}
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        {imageUrl && (
          <button type="button" onClick={() => setImageUrl('')} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 cursor-pointer w-fit transition-colors">
            <Trash2 size={13} /> Remover foto
          </button>
        )}
      </div>

      {/* Nome */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">Nome *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-b border-black/15 bg-transparent px-0 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
          placeholder="Ex: Anel solitário prata 925"
        />
      </div>

      {/* Descrição */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="border-b border-black/15 bg-transparent px-0 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors resize-none"
          placeholder="Detalhes do produto (opcional)"
        />
      </div>

      {/* Preço */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">Preço (R$) *</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="0"
          step="0.01"
          className="border-b border-black/15 bg-transparent px-0 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
          placeholder="0,00"
        />
      </div>

      {/* Categoria */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">Categoria</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border-b border-black/15 bg-transparent px-0 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors appearance-none cursor-pointer"
        >
          <option value="">Sem categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Visível */}
      <button
        type="button"
        onClick={() => setActive(!active)}
        className="flex items-center justify-between py-3 border-b border-black/8 cursor-pointer group"
      >
        <div>
          <p className="text-sm text-[#1a1a1a] text-left">Visível no catálogo</p>
          <p className="text-xs text-[#1a1a1a]/40 text-left mt-0.5">{active ? 'Produto aparece para os clientes' : 'Produto oculto para os clientes'}</p>
        </div>
        <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${active ? 'bg-[#1a1a1a]' : 'bg-[#1a1a1a]/20'}`}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
        </div>
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full bg-[#1a1a1a] text-white py-3.5 text-sm tracking-widest uppercase font-medium hover:bg-black disabled:opacity-40 transition-colors cursor-pointer"
        >
          {saving ? 'Salvando...' : product ? 'Salvar alterações' : 'Criar produto'}
        </button>
        {product && (
          <button
            type="button"
            onClick={handleDelete}
            className="w-full py-3 text-sm text-red-400 hover:text-red-500 transition-colors cursor-pointer border border-red-200/50 rounded"
          >
            Excluir produto
          </button>
        )}
      </div>
    </form>
  )
}
