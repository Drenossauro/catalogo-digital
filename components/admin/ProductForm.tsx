'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Category, Product } from '@/types'
import { Upload, Trash2 } from 'lucide-react'

interface Props {
  categories: Category[]
  product?: Product
}

export default function ProductForm({ categories, product }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
  const [active, setActive] = useState(product?.active ?? true)
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `products/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError('Erro ao fazer upload da imagem.')
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    setImageUrl(data.publicUrl)
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const supabase = createClient()
    const payload = {
      name,
      description: description || null,
      price: parseFloat(price),
      category_id: categoryId || null,
      active,
      image_url: imageUrl || null,
    }

    if (product) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id)
      if (error) { setError('Erro ao salvar produto.'); setSaving(false); return }
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) { setError('Erro ao criar produto.'); setSaving(false); return }
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  async function handleDelete() {
    if (!product || !confirm('Tem certeza que deseja excluir este produto?')) return
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', product.id)
    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
      {/* Imagem */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Foto do produto</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="relative w-full aspect-square max-w-[200px] border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          {imageUrl ? (
            <Image src={imageUrl} alt="Produto" fill className="object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <Upload size={24} />
              <span className="text-xs">{uploading ? 'Enviando...' : 'Clique para enviar'}</span>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        {imageUrl && (
          <button
            type="button"
            onClick={() => setImageUrl('')}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 cursor-pointer w-fit"
          >
            <Trash2 size={13} /> Remover imagem
          </button>
        )}
      </div>

      {/* Nome */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Nome *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="Ex: Anel solitário prata 925"
        />
      </div>

      {/* Descrição */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          placeholder="Detalhes do produto (opcional)"
        />
      </div>

      {/* Preço e Categoria */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Preço (R$) *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="0,00"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Categoria</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          >
            <option value="">Sem categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ativo */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 accent-gray-900"
        />
        <span className="text-sm font-medium text-gray-700">Produto visível no catálogo</span>
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {saving ? 'Salvando...' : product ? 'Salvar alterações' : 'Criar produto'}
        </button>
        {product && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2.5 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors cursor-pointer"
          >
            Excluir
          </button>
        )}
      </div>
    </form>
  )
}
