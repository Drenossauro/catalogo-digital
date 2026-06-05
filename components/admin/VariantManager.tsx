'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'

export interface VariantOption {
  value: string
  price_modifier: number
}

export interface VariantGroup {
  id?: string         // existe se já salvo no banco
  label: string
  options: VariantOption[]
  required: boolean
  position: number
}

interface Props {
  productId: string
  initialVariants: VariantGroup[]
  disabled?: boolean  // true quando plano não suporta variantes
}

export default function VariantManager({ productId, initialVariants, disabled }: Props) {
  const [variants, setVariants] = useState<VariantGroup[]>(initialVariants)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [rawPrices, setRawPrices] = useState<Record<string, string>>({})

  function addGroup() {
    setVariants((prev) => [
      ...prev,
      { label: '', options: [{ value: '', price_modifier: 0 }], required: false, position: prev.length },
    ])
  }

  function removeGroup(idx: number) {
    setVariants((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateGroup(idx: number, field: keyof VariantGroup, value: unknown) {
    setVariants((prev) => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g))
  }

  function addOption(gIdx: number) {
    setVariants((prev) => prev.map((g, i) =>
      i === gIdx ? { ...g, options: [...g.options, { value: '', price_modifier: 0 }] } : g,
    ))
  }

  function removeOption(gIdx: number, oIdx: number) {
    setVariants((prev) => prev.map((g, i) =>
      i === gIdx ? { ...g, options: g.options.filter((_, j) => j !== oIdx) } : g,
    ))
  }

  function updateOption(gIdx: number, oIdx: number, field: keyof VariantOption, value: string | number) {
    setVariants((prev) => prev.map((g, i) =>
      i === gIdx
        ? { ...g, options: g.options.map((o, j) => j === oIdx ? { ...o, [field]: value } : o) }
        : g,
    ))
  }

  async function handleSave() {
    setSaving(true)
    setMsg(null)
    try {
      for (const [idx, v] of variants.entries()) {
        if (!v.label.trim()) continue
        const validOptions = v.options.filter((o) => o.value.trim())
        const body = { productId, label: v.label, options: validOptions, required: v.required, position: idx }

        if (v.id) {
          await fetch('/api/admin/variantes', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: v.id, ...body }),
          })
        } else {
          const res = await fetch('/api/admin/variantes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          if (res.ok) {
            const saved = await res.json()
            setVariants((prev) => prev.map((g, i) => i === idx ? { ...g, id: saved.id } : g))
          }
        }
      }
      setMsg('Variantes salvas!')
    } catch {
      setMsg('Erro ao salvar variantes.')
    }
    setSaving(false)
  }

  async function handleDelete(idx: number) {
    const v = variants[idx]
    if (v.id) {
      await fetch(`/api/admin/variantes?id=${v.id}`, { method: 'DELETE' })
    }
    removeGroup(idx)
  }

  if (disabled) {
    return (
      <div className="border border-dashed border-black/15 p-4 text-center">
        <p className="text-xs text-[#1a1a1a]/40">
          Variantes de produto estão disponíveis nos planos <strong>Pro</strong> e <strong>Business</strong>.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {variants.map((group, gIdx) => (
        <div key={gIdx} className="border border-black/10 p-4 rounded-lg">
          <div className="flex items-start gap-2 mb-3">
            <GripVertical size={16} className="text-[#1a1a1a]/20 mt-2 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={group.label}
                  onChange={(e) => updateGroup(gIdx, 'label', e.target.value)}
                  placeholder="Ex: Tamanho, Cor..."
                  className="flex-1 border-b border-black/15 bg-transparent py-1.5 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
                />
                <label className="flex items-center gap-1.5 text-xs text-[#1a1a1a]/50 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={group.required}
                    onChange={(e) => updateGroup(gIdx, 'required', e.target.checked)}
                    className="cursor-pointer"
                  />
                  Obrigatório
                </label>
              </div>

              {/* Opções */}
              <div className="flex flex-col gap-2 mb-3">
                {group.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt.value}
                      onChange={(e) => updateOption(gIdx, oIdx, 'value', e.target.value)}
                      placeholder="Ex: P, M, G"
                      className="flex-1 border-b border-black/10 bg-transparent py-1 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-[#1a1a1a]/30">+R$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={rawPrices[`${gIdx}-${oIdx}`] ?? (opt.price_modifier ? String(opt.price_modifier).replace('.', ',') : '')}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^\d,\.]/g, '')
                          setRawPrices((prev) => ({ ...prev, [`${gIdx}-${oIdx}`]: val }))
                        }}
                        onBlur={() => {
                          const raw = rawPrices[`${gIdx}-${oIdx}`] ?? ''
                          const num = parseFloat(raw.replace(',', '.')) || 0
                          updateOption(gIdx, oIdx, 'price_modifier', num)
                          setRawPrices((prev) => { const next = { ...prev }; delete next[`${gIdx}-${oIdx}`]; return next })
                        }}
                        placeholder="0,00"
                        className="w-16 border-b border-black/10 bg-transparent py-1 text-sm text-right focus:outline-none focus:border-[#1a1a1a] transition-colors"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOption(gIdx, oIdx)}
                      disabled={group.options.length === 1}
                      className="text-[#1a1a1a]/20 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-30"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addOption(gIdx)}
                className="flex items-center gap-1 text-xs text-[#1a1a1a]/40 hover:text-[#1a1a1a] cursor-pointer transition-colors"
              >
                <Plus size={12} /> Adicionar opção
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(gIdx)}
              className="text-[#1a1a1a]/20 hover:text-red-400 transition-colors cursor-pointer shrink-0"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={addGroup}
          className="flex items-center gap-1.5 text-sm text-[#1a1a1a]/50 hover:text-[#1a1a1a] cursor-pointer transition-colors border border-dashed border-black/20 px-3 py-2 hover:border-[#1a1a1a]/40"
        >
          <Plus size={14} /> Novo grupo de variante
        </button>

        {variants.length > 0 && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="text-sm bg-[#1a1a1a] text-white px-4 py-2 hover:bg-black transition-colors cursor-pointer disabled:opacity-40"
          >
            {saving ? 'Salvando...' : 'Salvar variantes'}
          </button>
        )}
      </div>

      {msg && <p className="text-xs text-[#1a1a1a]/50">{msg}</p>}
    </div>
  )
}
